/**
 * `/sitemap.xml`
 *
 * A route handler rather than Next's `app/sitemap.ts` metadata convention, and
 * the reason is the origin.
 *
 * A sitemap must list absolute URLs. `sitemap.ts` builds them from
 * `metadataBase` (or the deployment URL), which means either hard-coding a host
 * in config — where a staging deploy then advertises production URLs until
 * someone remembers to change it — or relying on a platform variable that is
 * not set in every environment. A route handler reads the request's own origin,
 * which is correct everywhere with no config at all.
 *
 * `force-dynamic` for the same reason, plus freshness: a sitemap baked at build
 * time goes stale the moment anything is published, which for the file crawlers
 * use to discover new content is the wrong trade. It costs one GraphQL call
 * behind a cached content listing.
 *
 * Mirrors astro-starter's `pages/sitemap.xml.ts`.
 */

import { collectSitemapUrls, renderSitemapXml } from '@/lib/wp/sitemap';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  try {
    const entries = await collectSitemapUrls(origin);
    return new Response(renderSitemapXml(entries), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        // Crawlers re-fetch this rarely; an hour keeps it fresh without making
        // every crawl hit WordPress.
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    // `collectSitemapUrls` throws when the content listing fails, which is
    // deliberate — an empty sitemap tells a crawler the site has no pages, and
    // that is worse than no sitemap at all. A 503 makes it retry instead.
    console.error('[sitemap] failed to build:', error);
    return new Response('Sitemap temporarily unavailable', {
      status: 503,
      headers: { 'Retry-After': '600' },
    });
  }
}
