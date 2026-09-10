/**
 * In-process TTL cache with stale-while-revalidate.
 *
 * This is the primitive behind both the redirect table and the rendered-response
 * cache. Astro has no ISR primitive — there is no equivalent to Next's
 * `revalidate`, and `@astrojs/node` in standalone mode provides nothing of the
 * sort — so the behaviour is implemented here instead of relying on a CDN or a
 * host-specific adapter.
 *
 * Semantics, per key:
 *   age < ttl                 → serve cached, no refresh
 *   ttl <= age < ttl + stale  → serve cached immediately, refresh in background
 *   age >= ttl + stale        → block on a fresh load
 *
 * The clock is injectable so the tiering is unit-testable without sleeping.
 *
 * KNOWN LIMITATION: this is per-process. With N app instances you get N cold
 * caches and up to N origin requests per key. Fine for single-instance deploys;
 * swap the store for Redis behind the same interface before scaling out.
 */

export interface TtlCacheOptions {
  /** Milliseconds a value is considered fresh. */
  ttlMs: number;
  /** Milliseconds past the TTL a stale value may still be served while refreshing. */
  staleMs?: number;
  /** Maximum entries before the oldest are evicted. */
  maxEntries?: number;
  /** Injectable clock, for tests. */
  now?: () => number;
  /**
   * Label used by `clearAllCaches()` reporting, and to opt a cache into
   * webhook-driven purging.
   *
   * Caches without a name are left alone by `clearAllCaches()` — a test's
   * throwaway instance should not be reachable from an HTTP endpoint.
   */
  name?: string;
}

/**
 * Every named cache, so the revalidation webhook can purge them.
 *
 * The instances themselves are module-private consts in the modules that own
 * them, which is the right scope for ordinary use — but it leaves nothing for
 * an inbound purge request to act on. Registering here keeps them private
 * while making them collectively reachable, rather than exporting a handful of
 * mutable singletons.
 */
const registry = new Map<string, TtlCache<unknown>>();

/**
 * Empty every named cache. Returns the names cleared, for the endpoint to
 * report.
 *
 * Note this is per-process, inheriting the limitation described above: with N
 * app instances, a webhook purges only the instance it happens to reach.
 */
export function clearAllCaches(): string[] {
  const cleared: string[] = [];
  for (const [name, cache] of registry) {
    cache.clear();
    cleared.push(name);
  }
  return cleared;
}

/**
 * Delete one key from one named cache.
 *
 * Used for path-targeted purges, where the payload names an exact URL and
 * clearing the whole response cache would be needlessly wasteful.
 *
 * Returns whether an entry was actually removed — NOT merely whether the cache
 * exists. The distinction matters because the caller reports this back over
 * HTTP: an endpoint claiming it purged `/hello-world/` when that page was never
 * cached is worse than saying nothing, since it makes a no-op look like a
 * successful invalidation while debugging a staleness complaint.
 */
export function deleteCacheKey(cacheName: string, key: string): boolean {
  const cache = registry.get(cacheName);
  if (!cache) return false;
  return cache.delete(key);
}

/**
 * Names of the caches currently registered.
 *
 * Populated as a side effect of module evaluation, so this grows over a
 * process's life: a cache whose module has not been imported yet is absent.
 * That is harmless for purging — an unevaluated module's cache is necessarily
 * empty — but it does mean this list legitimately differs between two calls,
 * and is not a reliable inventory of every cache in the codebase.
 */
export function registeredCaches(): string[] {
  return [...registry.keys()];
}

interface Entry<V> {
  value: V;
  storedAt: number;
}

export class TtlCache<V> {
  private readonly store = new Map<string, Entry<V>>();
  private readonly inflight = new Map<string, Promise<V>>();
  private readonly ttlMs: number;
  private readonly staleMs: number;
  private readonly maxEntries: number;
  private readonly now: () => number;

  constructor(options: TtlCacheOptions) {
    this.ttlMs = options.ttlMs;
    this.staleMs = options.staleMs ?? 0;
    this.maxEntries = options.maxEntries ?? 500;
    this.now = options.now ?? (() => Date.now());

    if (options.name) {
      registry.set(options.name, this as TtlCache<unknown>);
    }
  }

  /**
   * Return the cached value, loading it if absent or too stale to serve.
   *
   * Concurrent callers for the same key share one in-flight load, so a cold
   * cache under load produces a single origin request rather than one per
   * request.
   */
  async get(key: string, load: () => Promise<V>): Promise<V> {
    return (await this.getWithStatus(key, load)).value;
  }

  /**
   * As `get`, but also reports where the value came from.
   *
   * Callers that expose cache state — an `x-response-cache` header, say — need
   * this rather than inferring it, since a value present in the store may still
   * have been too old to serve.
   */
  async getWithStatus(
    key: string,
    load: () => Promise<V>,
  ): Promise<{ value: V; status: 'hit' | 'stale' | 'miss' }> {
    const entry = this.store.get(key);
    const age = entry ? this.now() - entry.storedAt : Infinity;

    if (entry && age < this.ttlMs) {
      return { value: entry.value, status: 'hit' };
    }

    if (entry && age < this.ttlMs + this.staleMs) {
      // Serve stale, refresh behind it. Errors are swallowed deliberately: a
      // failed background refresh should leave the stale value in place rather
      // than surface to the request that happened to trigger it.
      void this.refresh(key, load).catch(() => {});
      return { value: entry.value, status: 'stale' };
    }

    return { value: await this.refresh(key, load), status: 'miss' };
  }

  /** Peek without loading. Returns undefined when absent, regardless of age. */
  peek(key: string): V | undefined {
    return this.store.get(key)?.value;
  }

  set(key: string, value: V): void {
    this.store.set(key, { value, storedAt: this.now() });
    this.evict();
  }

  /** Returns whether the key was actually present, so callers can report honestly. */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
    this.inflight.clear();
  }

  get size(): number {
    return this.store.size;
  }

  private async refresh(key: string, load: () => Promise<V>): Promise<V> {
    const existing = this.inflight.get(key);
    if (existing) return existing;

    const promise = (async () => {
      try {
        const value = await load();
        this.set(key, value);
        return value;
      } finally {
        this.inflight.delete(key);
      }
    })();

    this.inflight.set(key, promise);
    return promise;
  }

  /** Map preserves insertion order, so the first key is the oldest written. */
  private evict(): void {
    while (this.store.size > this.maxEntries) {
      const oldest = this.store.keys().next();
      if (oldest.done) break;
      this.store.delete(oldest.value);
    }
  }
}
