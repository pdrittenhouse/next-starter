/**
 * Request proxy — Next's `proxy` file convention, formerly `middleware`.
 *
 * Two jobs:
 *
 *   1. Rewrite query-dependent requests onto dedicated dynamic routes, so the
 *      main content route never reads `searchParams` and can stay on the
 *      static/ISR path.
 *   2. Resolve WordPress redirects from a cached table.
 *
 * Rewrites (not redirects) — the URL in the address bar is unchanged, so
 * WordPress's own `/?s=query` search URLs and the `?after=` cursor links built
 * by `partials/pagination.tsx` keep working exactly as before.
 *
 * ─── The filename and the export name are coupled ────────────────────────────
 *
 * Next 16 renamed this convention from `middleware` to `proxy` and warns on
 * every build while the old name is used. The rename is not just the file:
 * `build/templates/middleware.js` resolves the handler as
 *
 *     const isProxy = page === '/proxy' || page === '/src/proxy';
 *     const handlerUserland = (isProxy ? mod.proxy : mod.middleware) || mod.default;
 *
 * so once the file is `proxy.ts` the export MUST be named `proxy` (or be the
 * default export). Renaming only one of the two throws
 * `ProxyMissingExportError` — loudly, which is the good outcome.
 *
 * Keeping both `middleware.ts` and `proxy.ts` is a hard build error (E900), so
 * this is a move, never a copy. Requires Next >= 16; on 15 the file is not a
 * recognised convention at all and would simply never run — no redirects, and
 * `/?s=` rendering the homepage.
 *
 * Everything else carried over unchanged: `NextProxy` is a pure alias of
 * `NextMiddleware`, `ProxyConfig` and `MiddlewareConfig` are the same type, and
 * `config.matcher` is read by the same matcher parser.
 *
 * NOTE: no response cache here, unlike astro-starter's middleware (Astro kept
 * that name). Next has its own ISR — `revalidate` on the content route — so an
 * HTML cache in front of it would store the same output twice with two
 * independent expiry clocks. Astro has no ISR primitive, which is why it needs
 * one.
 */

import { NextResponse, type NextRequest } from 'next/server';
import type { ProxyConfig } from 'next/server';
import { matchRedirect } from '@/lib/wp/redirectTable';
import {
  WP_SERVER_PREFIXES,
  firstSegment,
  isAppRoute,
  isNonContentPath,
} from '@/lib/routes';

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname, searchParams } = nextUrl;

  if (isNonContentPath(pathname)) {
    if (WP_SERVER_PREFIXES.has(firstSegment(pathname) ?? '')) {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

  // This app's own routes handle their own query params — never rewrite them.
  // The list lives in lib/routes.ts, shared with generateStaticParams so the
  // two cannot drift. It previously omitted /author and /data, so
  // `/author/jane?s=cat` was rewritten onto /search and the author archive
  // silently became a search results page.
  if (isAppRoute(pathname)) {
    return NextResponse.next();
  }

  // ── 1. Query-dependent rewrites ────────────────────────────────────────────

  // WordPress search: /?s=query → /search?s=query
  if (searchParams.has('s')) {
    const url = nextUrl.clone();
    url.pathname = '/search';
    return NextResponse.rewrite(url);
  }

  // Pagination cursors: /category/foo?after=X → /paged/category/foo?after=X
  if (searchParams.has('after') || searchParams.has('before')) {
    const url = nextUrl.clone();
    url.pathname = `/paged${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  // ── 2. Redirects ───────────────────────────────────────────────────────────
  //
  // Checked before content resolution: a redirect takes priority over existing
  // content, so /hello-world can be both a real post and a configured redirect.
  //
  // Backed by the GET_REDIRECTS table with an in-process cache. Replaces the
  // live fetch(uri, { redirect: 'manual' }) probe in utils.ts#checkRedirects(),
  // which cost a full WordPress page render — ~0.47s — on every request.
  //
  // BEHAVIOUR CHANGE: the probe was mechanism-agnostic and caught redirects from
  // any source. The table only covers the Redirection plugin, so a wp_redirect
  // in a theme hook or a server rewrite is no longer honoured.
  if (request.method === 'GET') {
    try {
      const match = await matchRedirect(pathname);
      if (match) {
        return NextResponse.redirect(new URL(match.to, nextUrl.origin), match.statusCode);
      }
    } catch (error) {
      // A redirect-table failure must not take down the page.
      console.error('[proxy] redirect lookup failed:', error);
    }
  }

  return NextResponse.next();
}

export const config: ProxyConfig = {
  // Skip Next internals and the favicon; everything else goes through.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
