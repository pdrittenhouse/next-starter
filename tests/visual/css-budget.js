'use strict';

/**
 * Measures render-blocking CSS for a page: every `<link rel="stylesheet">` whose
 * `media` attribute, in the page's *raw initial HTML*, is not `print`. `media`
 * defaults to `all` when absent, which also blocks.
 *
 * Why the raw HTML and not the live DOM: this theme's deferred stylesheets load as
 * `media="print" onload="this.media='all'"` — non-blocking until the swap fires. By
 * the time a script can query `document.querySelectorAll('link')`, every deferred
 * sheet that has already loaded shows `media="all"` too, indistinguishable from one
 * that was render-blocking from the start. The navigation response's own text, read
 * before any `onload` has had a chance to fire, still has the pre-swap value.
 *
 * `<noscript>` fallbacks are stripped first. They duplicate each deferred
 * stylesheet with `media="all"` for non-JS clients, which Chromium (JS enabled, as
 * Playwright always runs it) never parses — counting them would double every
 * deferred bundle's real cost.
 *
 * Byte sizes come from the real `response.body()` of each request this navigation
 * actually made, not a second fetch — so this MUST run in a context that has never
 * requested these URLs before (Playwright's default per-test context, fresh every
 * time, guarantees that). Reusing one context/page across multiple measured pages
 * will under-report: a same-session repeat request can be served as a 304 with no
 * body, silently zeroing that stylesheet's contribution.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} url
 * @returns {Promise<{totalBytes: number, blockingCount: number, breakdown: Array<{href: string, bytes: number}>}>}
 */
async function measureRenderBlockingCss(page, url) {
  const sizes = new Map();
  const onResponse = async (response) => {
    if (response.request().resourceType() !== 'stylesheet') return;
    try {
      sizes.set(response.url(), (await response.body()).length);
    } catch (e) {
      // Navigated away / aborted mid-flight — not countable, and not fatal to the measurement.
    }
  };
  page.on('response', onResponse);

  const mainResponse = await page.goto(url, { waitUntil: 'load' });
  await page.waitForLoadState('networkidle').catch(() => {});
  page.off('response', onResponse);

  const html = await mainResponse.text();
  const withoutNoscript = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, '');

  const linkRe = /<link\s+[^>]*rel=['"]stylesheet['"][^>]*>/gi;
  const hrefRe = /href=['"]([^'"]+)['"]/i;
  const mediaRe = /media=['"]([^'"]+)['"]/i;

  const blockingHrefs = new Set();
  let m;
  while ((m = linkRe.exec(withoutNoscript))) {
    const tag = m[0];
    const media = (mediaRe.exec(tag) || [, 'all'])[1];
    if (media.trim().toLowerCase() === 'print') continue;
    const href = hrefRe.exec(tag);
    if (href) blockingHrefs.add(new URL(href[1], url).toString());
  }

  let totalBytes = 0;
  const breakdown = [];
  for (const href of blockingHrefs) {
    const bytes = sizes.get(href) ?? 0;
    totalBytes += bytes;
    breakdown.push({ href, bytes });
  }
  breakdown.sort((a, b) => b.bytes - a.bytes);

  return { totalBytes, blockingCount: blockingHrefs.size, breakdown };
}

/**
 * Floor below which a page's render-blocking CSS is treated as "a bundle was written
 * empty" rather than "this page is light" (T4).
 *
 * Lives here rather than in `canary.spec.js` so F5's self-check asserts against the same
 * number the canary enforces. Duplicating it would let the two drift, and a self-check
 * proving a stale threshold fires is worse than no self-check: it reports confidence in a
 * guarantee nobody is enforcing any more.
 */
const MIN_RENDER_BLOCKING_BYTES = 50 * 1024;

module.exports = { measureRenderBlockingCss, MIN_RENDER_BLOCKING_BYTES };
