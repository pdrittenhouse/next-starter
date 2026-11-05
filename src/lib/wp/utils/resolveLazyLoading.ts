/**
 * Map ACF's `lazy_loading` clone group onto the `loading` / `fetchPriority` props the Image
 * atom already accepts (H1).
 *
 * Why this exists
 * ---------------
 * Twelve ACF blocks carry a `lazy_loading` clone group, and its values have been arriving in
 * `attributesJSON` all along:
 *
 *   "lazy_loading": { "disable_lazy_loading": false, "prioritize_image": false }
 *
 * Nothing read them. An editor ticking "prioritize this image" or "disable lazy loading" got
 * silently no effect. This is a CORRECTNESS fix, not a performance one — see the note at the
 * bottom before anyone measures LCP expecting movement.
 *
 * Precedence
 * ----------
 * `prioritize_image` wins over everything, because it is the explicit LCP hint and the only
 * reason an editor would reach for it. It implies eager loading: a high-priority fetch that is
 * still lazily loaded is self-contradictory, and `next/image`'s `priority` flag disables lazy
 * loading anyway.
 *
 *   prioritize_image: true   -> { loading: 'eager', fetchPriority: 'high' }
 *   disable_lazy_loading     -> { loading: 'eager' }
 *   neither                  -> the block's own `loading`, else the caller's default
 *
 * A block's own top-level `loading` field (the image block has one) is therefore a FALLBACK,
 * overridden by either flag rather than competing with them.
 *
 * Both keys are snake_case because they come from `attributesJSON`, not from the typed
 * GraphQL fields. The schema does expose `BlockImageLazyLoading { disableLazyLoading
 * prioritizeImage }` and eleven siblings, but the starters fetch blocks via `attributesJSON`,
 * so that path is unused — no query change was needed for any of this.
 *
 * What this does NOT reach
 * ------------------------
 * Only the `<Image>` an affected block renders. `card` and `hero-unit` each have BOTH an
 * inline image and a background image, and both are wired here for the inline one; `section`
 * is background-only. A CSS `background-image` cannot carry `fetchpriority` or `loading` at
 * all, so for the background half the equivalent lever is `<link rel="preload">`, a different
 * mechanism in `<head>`. Measured on this install and deliberately not built: the LCP element
 * is the site HEADER's background (`header.jpg`, 17 KB), requested 903ms — just 77ms after the
 * first CSS — and fully downloaded by 911ms, while LCP does not register until 1,808ms. The
 * image spends ~900ms already downloaded, so preloading it recovers nothing, and this project
 * has already measured a preload stealing priority from genuinely blocking CSS.
 *
 * So: expect no LCP movement from this. The defect being fixed is that the editor's choice did
 * nothing.
 */

/** The `lazy_loading` clone group as it appears in `attributesJSON.data`. */
export interface LazyLoadingGroup {
  disable_lazy_loading?: boolean | null;
  prioritize_image?: boolean | null;
}

/** Any block's parsed `data`, narrowed to the parts this helper reads. */
export interface LazyLoadingCarrier {
  lazy_loading?: LazyLoadingGroup | null;
  /** Some blocks (image) also expose a flat `loading`; used only as a fallback. */
  loading?: 'lazy' | 'eager' | null;
  /** Flat variants, for a block whose clone was stored unnested. */
  lazy_loading_disable_lazy_loading?: boolean | null;
  lazy_loading_prioritize_image?: boolean | null;
}

export interface ResolvedLoading {
  loading: 'lazy' | 'eager';
  /** Omitted unless the editor asked for priority, so the attribute is absent by default. */
  fetchPriority?: 'high';
}

/**
 * @param data            Parsed `attributesJSON.data` for the block.
 * @param fallbackLoading Used when neither flag is set and the block has no `loading` of its own.
 */
export function resolveLazyLoading(
  data: LazyLoadingCarrier | null | undefined,
  fallbackLoading: 'lazy' | 'eager' = 'lazy',
): ResolvedLoading {
  const group = data?.lazy_loading ?? null;

  // Both shapes are accepted: ACF stores a clone either nested under its group name or
  // flattened with the group as a prefix, depending on the field's `display` setting. Reading
  // only the nested form yields `undefined` silently wherever the other was used.
  const prioritize = group?.prioritize_image ?? data?.lazy_loading_prioritize_image ?? false;
  const disable = group?.disable_lazy_loading ?? data?.lazy_loading_disable_lazy_loading ?? false;

  if (prioritize === true) {
    return { loading: 'eager', fetchPriority: 'high' };
  }
  if (disable === true) {
    return { loading: 'eager' };
  }
  return { loading: data?.loading ?? fallbackLoading };
}
