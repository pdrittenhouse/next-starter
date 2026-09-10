/**
 * `/robots.txt`
 *
 * Exists mainly to advertise the sitemap: a sitemap nothing points at is only
 * discoverable by submitting it manually to each search engine.
 *
 * A route handler rather than Next's `app/robots.ts` metadata convention, for
 * the same reason as the sitemap: the `Sitemap:` line has to be an absolute
 * URL, and `robots.ts` builds it from `metadataBase` — which means hard-coding
 * a host that a staging deploy then gets wrong. Reading the request's own
 * origin is correct everywhere with no config.
 *
 * Mirrors astro-starter's `pages/robots.txt.ts`.
 */

export const dynamic = 'force-dynamic';

/**
 * Paths that should not be crawled — internal plumbing rather than content:
 *
 *   /api/    JSON endpoints
 *   /preview per-user draft rendering, gated on a token cookie anyway
 *   /paged/  the internal rewrite target the proxy sends cursor requests to.
 *            A crawler reaching it directly would index the same listing under
 *            two URLs — see proxy.ts.
 *
 * Deliberately NOT disallowed: /search and paginated views. Those are already
 * `noindex`, and a Disallow would stop crawlers reading that directive at all,
 * which is the slower way to the same outcome.
 */
const DISALLOW = ['/api/', '/preview', '/paged/'];

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  const body = [
    'User-agent: *',
    'Allow: /',
    ...DISALLOW.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
