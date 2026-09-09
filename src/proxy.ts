/**
 * Request middleware.
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
 * NOTE: no response cache here, unlike astro-starter's middleware. Next has its
 * own ISR — `revalidate` on the content route — so an HTML cache in front of it
 * would store the same output twice with two independent expiry clocks. Astro
 * has no ISR primitive, which is why it needs one.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { matchRedirect } from '@/lib/wp/redirectTable';

/** WordPress server paths that can never be front-end content. */
const WP_SERVER_PREFIXES = new Set([
  'wp-content',
  'wp-admin',
  'wp-includes',
  'wp-json',
  'wp-cron.php',
]);

const ASSET_EXTENSION =
  /\.(ico|png|jpg|jpeg|gif|webp|avif|svg|css|js|mjs|map|txt|xml|json|woff|woff2|ttf|eot|pdf|zip)$/i;

function firstSegment(pathname: string): string | undefined {
  return pathname.split('/').filter(Boolean)[0];
}

function isNonContentPath(pathname: string): boolean {
  const first = firstSegment(pathname);
  if (!first) return false;
  if (WP_SERVER_PREFIXES.has(first)) return true;
  const segments = pathname.split('/').filter(Boolean);
  return ASSET_EXTENSION.test(segments[segments.length - 1]);
}

/** Routes that already handle their own query params — never rewrite these. */
function isOwnDynamicRoute(pathname: string): boolean {
  return (
    pathname === '/search' ||
    pathname.startsWith('/search/') ||
    pathname.startsWith('/paged/') ||
    pathname === '/preview' ||
    pathname.startsWith('/preview/') ||
    pathname.startsWith('/api/')
  );
}

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname, searchParams } = nextUrl;

  if (isNonContentPath(pathname)) {
    if (WP_SERVER_PREFIXES.has(firstSegment(pathname) ?? '')) {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

  if (isOwnDynamicRoute(pathname)) {
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
      console.error('[middleware] redirect lookup failed:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals and the favicon; everything else goes through.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
