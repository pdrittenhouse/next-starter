'use strict';

/**
 * Stylesheet order extraction for X15's load-order contract.
 *
 * Split out of `load-order.spec.js` (F5) so the self-check can assert against the *same*
 * parser the gate uses rather than a second copy of these regexes. A self-check that
 * reimplements the logic it is checking proves only that two implementations agree, and
 * says nothing about the one that actually runs.
 */

/**
 * Ordered stylesheet paths from a navigation response's raw HTML.
 *
 * Read from the document text, not the live DOM, for the same reason `css-budget.js` does:
 * this theme's deferred sheets load as `media="print" onload="this.media='all'"`, so once
 * the swap fires a deferred sheet is indistinguishable in the DOM from one that was
 * render-blocking from the start.
 *
 * `<noscript>` blocks are stripped first — they duplicate every deferred sheet with
 * `media="all"` for JS-off clients, which Chromium never parses. Counting them would show
 * every deferred bundle a second time as render-blocking.
 *
 * `all` is raw document position across every stylesheet `<link>` regardless of media,
 * which is what CSS cascade priority actually keys on. `blocking` / `deferred` are the
 * same paths partitioned by initial media, for the bucket-scoped tier contract only.
 *
 * `noscriptFallbacks` is collected from those stripped blocks before they are discarded, so
 * the pairing can be asserted. A deferred sheet whose `<noscript>` twin is missing is
 * invisible on a normal page -- the swap fires and everything looks right -- and silently
 * drops that stylesheet entirely for a client with JS off. `defer_content_css()` emits the
 * twin today; nothing checked that it still does.
 *
 * @param {string} html
 * @returns {{all: string[], blocking: string[], deferred: string[], stuck: string[], noscriptFallbacks: string[]}}
 */
function parseStylesheetOrder(html) {
  const linkReAll = /<link[^>]*rel=['"]stylesheet['"][^>]*>/gi;
  const hrefReAll = /href=['"]([^'"]+)['"]/i;

  // Harvested BEFORE the strip below, which is the only chance to see them.
  const noscriptFallbacks = [];
  for (const block of html.match(/<noscript>[\s\S]*?<\/noscript>/gi) || []) {
    for (const link of block.match(linkReAll) || []) {
      const href = hrefReAll.exec(link);
      if (href) noscriptFallbacks.push(href[1].split('?')[0]);
    }
  }

  const stripped = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, '');

  const linkRe = /<link[^>]*rel=['"]stylesheet['"][^>]*>/gi;
  const hrefRe = /href=['"]([^'"]+)['"]/i;
  const mediaRe = /media=['"]([^'"]+)['"]/i;

  const all = [];
  const blocking = [];
  const deferred = [];
  // `media="print"` with no `onload` is not deferred -- it is a stylesheet that will be
  // downloaded and never applied to screen. Classifying on media alone made the two
  // indistinguishable, so a stuck sheet counted as a successful deferral and the suite passed.
  //
  // That is not hypothetical. `Performance::defer_content_css()` returned the tag untouched on
  // two paths -- when CSP blocks inline event handlers, and when a filter removed a handle from
  // the deferred list -- leaving `print` in place. Forcing CSP on reproduced it: five
  // stylesheets fetched, none applied, and this parser reported five successful deferrals.
  const stuck = [];
  let m;
  while ((m = linkRe.exec(stripped))) {
    const href = hrefRe.exec(m[0]);
    if (!href) continue;
    const media = (mediaRe.exec(m[0]) || [, 'all'])[1].trim().toLowerCase();
    const path = href[1].split('?')[0];
    all.push(path);
    if (media !== 'print') {
      blocking.push(path);
    } else if (/\bonload=/i.test(m[0])) {
      deferred.push(path);
    } else {
      stuck.push(path);
    }
  }
  return { all, blocking, deferred, stuck, noscriptFallbacks };
}

/**
 * Document positions of a `requires` pair, or -1 where that sheet is not enqueued.
 *
 * Matched against `all` (raw document position) rather than a media bucket, deliberately:
 * once a `media="print"` sheet's `onload` swaps it to `all`, its cascade priority is still
 * decided by where its `<link>` sits in the DOM. A deferred sheet can therefore legitimately
 * need to precede a render-blocking one — `bootstrap-utilities-full` before `child-styles`
 * is exactly that case — and a bucket-scoped lookup cannot express it.
 *
 * @param {string[]} all document-ordered paths from {@see parseStylesheetOrder}
 * @param {{before: string, after: string}} req
 * @returns {{beforeAt: number, afterAt: number}}
 */
function positionsFor(all, req) {
  return {
    beforeAt: all.findIndex((h) => h.includes(req.before)),
    afterAt: all.findIndex((h) => h.includes(req.after)),
  };
}

module.exports = { parseStylesheetOrder, positionsFor };
