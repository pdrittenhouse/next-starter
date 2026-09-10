/**
 * Normalise the HTML WordPress hands back in `renderedHtml` and `content`.
 *
 * Most core blocks have no component in BLOCK_MAP — deliberately, since
 * WordPress's own server-rendered markup for a paragraph or a heading is
 * correct and reimplementing ~90 core blocks across two frameworks buys
 * nothing. But that markup is written for WordPress to serve, and two things
 * in it are wrong once a decoupled front end serves it instead.
 *
 * ─── 1. Absolute links point at the WordPress origin ─────────────────────────
 *
 * An internal link inside content comes back as
 * `href="http://wp.example.com/about/"`. Clicking it takes the visitor OFF the
 * front end and onto the WordPress install — which in production is a different
 * host, frequently not meant to be publicly reachable at all. Rewritten to
 * `/about/` so it stays on the front end.
 *
 * Not everything is rewritten. `/wp-admin/`, `/wp-login.php`, `/wp-json/` and
 * `/wp-content/` have to keep pointing at WordPress: they are WordPress's own
 * surfaces and the front end has no route for them. A link to a PDF in the
 * uploads directory must stay absolute or it 404s.
 *
 * ─── 2. Images carry no srcset, no dimensions and no lazy loading ────────────
 *
 * Measured on this install: the core/image markup was
 *
 *     <figure class="wp-block-image size-full"><img
 *       src="http://wp/wp-content/uploads/…/8f71a687….png" alt=""
 *       class="wp-image-3334"/></figure>
 *
 * — a 1.4 MB full-size PNG, 22% of the page's bytes and almost certainly the
 * LCP element, with no `srcset`, no `width`/`height` and no `loading`.
 *
 * `core/image` now has a real component (see CoreImageBlock) which runs it
 * through `next/image`, so that specific block no longer reaches this
 * function. But images inside blocks that are still unmapped — gallery, cover,
 * media-text — do. For those this adds `loading="lazy"` and
 * `decoding="async"`, which is cheap and safe. It deliberately does NOT
 * rewrite `src`: without the intrinsic dimensions there is nothing sensible to
 * build a srcset from, and guessing widths risks upscaling. Full optimisation
 * for those blocks comes when they get components of their own.
 *
 * ─── Why regex rather than a parser ──────────────────────────────────────────
 *
 * Neither starter has an HTML parsing dependency, and adding one to rewrite two
 * attribute shapes is poor value. The patterns here are anchored to specific
 * attributes on specific tags rather than trying to understand the document, so
 * the failure mode is "a URL is left alone", not "the markup is mangled".
 * Revisit if this grows past link and image handling.
 */

import { getWpConfig } from '@/lib/wp/config';

/** Path prefixes that must keep pointing at WordPress. */
const KEEP_ABSOLUTE = [
  '/wp-admin',
  '/wp-login.php',
  '/wp-json',
  '/wp-content',
  '/wp-includes',
  '/wp-cron.php',
];

/** The WordPress origin, e.g. `http://wp.example.com`, or '' when unresolvable. */
function wpOrigin(): string {
  try {
    const { graphqlUrl } = getWpConfig();
    if (!graphqlUrl) return '';
    return new URL(graphqlUrl).origin;
  } catch {
    return '';
  }
}

/**
 * Convert an absolute WordPress URL to a root-relative path, or return null to
 * leave it untouched.
 */
function toRootRelative(url: string, origin: string): string | null {
  if (!url.startsWith(origin)) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (KEEP_ABSOLUTE.some((p) => parsed.pathname === p || parsed.pathname.startsWith(`${p}/`))) {
    return null;
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

/**
 * Make a single URL safe to use as an href on the front end.
 *
 * `rewriteWpHtml` handles links inside WordPress-rendered HTML. This is for
 * URLs that arrive as *data* rather than markup — ACF link and button fields,
 * the co-brand logo URL, anything an editor typed into a URL field. Those come
 * back absolute against the WordPress origin and would send the visitor off the
 * front end just as content links did.
 *
 * Menu items do not need this: WPGraphQL exposes `path` alongside `url`, so
 * they read `path` first (see menuToNavItems).
 *
 * Returns the input unchanged when it is already relative, external, a
 * fragment, a mailto/tel, or points at a WordPress-owned path.
 */
export function toFrontEndUrl(url: string | null | undefined): string {
  if (!url) return '';
  const origin = wpOrigin();
  if (!origin) return url;
  return toRootRelative(url, origin) ?? url;
}

/**
 * Rewrite a block's `renderedHtml`, or a post's classic `content`, for serving
 * from the front end.
 *
 * Safe to call with null/undefined — returns ''. Idempotent: a second pass
 * finds no absolute origin and no `<img>` without `loading`.
 */
export function rewriteWpHtml(html: string | null | undefined): string {
  if (!html) return '';

  const origin = wpOrigin();
  let out = html;

  // ── Links ──────────────────────────────────────────────────────────────────
  if (origin) {
    out = out.replace(
      /(<a\b[^>]*?\shref=)(["'])([^"']+)\2/gi,
      (match, prefix: string, quote: string, url: string) => {
        const relative = toRootRelative(url, origin);
        return relative === null ? match : `${prefix}${quote}${relative}${quote}`;
      },
    );
  }

  // ── Images ─────────────────────────────────────────────────────────────────
  // Only tags that don't already declare `loading`, so an author's explicit
  // `loading="eager"` on an above-the-fold image is respected.
  out = out.replace(
    /<img\b(?![^>]*\bloading=)([^>]*)>/gi,
    (_match, attrs: string) => `<img loading="lazy" decoding="async"${attrs}>`,
  );

  return out;
}

/**
 * Apply `rewriteWpHtml` across a resolved WordPress node.
 *
 * Called from the node fetchers rather than from the block components that
 * inject `renderedHtml` via dangerouslySetInnerHTML, so every render path —
 * prerendered, ISR, and preview — gets the same treatment from one place.
 *
 * Returns a new object; the input is not mutated.
 */
export function normalizeWpNode<T>(node: T): T {
  if (!node || typeof node !== 'object') return node;

  const source = node as Record<string, unknown>;
  const out: Record<string, unknown> = { ...source };

  if (typeof source.content === 'string') {
    out.content = rewriteWpHtml(source.content);
  }

  if (Array.isArray(source.editorBlocks)) {
    out.editorBlocks = source.editorBlocks.map((block) => {
      if (!block || typeof block !== 'object') return block;
      const b = block as Record<string, unknown>;
      return typeof b.renderedHtml === 'string'
        ? { ...b, renderedHtml: rewriteWpHtml(b.renderedHtml) }
        : b;
    });
  }

  return out as T;
}
