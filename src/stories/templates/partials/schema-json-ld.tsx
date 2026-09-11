/**
 * schema.org JSON-LD for the current page.
 *
 * Mirrors `templates/partials/wrapper/schema.twig` and astro-starter's
 * equivalent, sharing the graph construction in `lib/wp/jsonLd.ts`.
 *
 * ─── Why this renders in the page and not the layout ────────────────────────
 *
 * astro-starter emits these from `BaseLayout`, which is the natural place —
 * it owns `<head>`. In the App Router a layout cannot receive page data, and
 * the graphs need the node's title, dates, author, image and breadcrumbs. So
 * this renders alongside the page content instead.
 *
 * That is fine: JSON-LD is valid anywhere in the document, and Google's
 * structured-data documentation explicitly allows it in the body. Next's own
 * guidance for App Router does the same thing.
 *
 * ─── The origin ─────────────────────────────────────────────────────────────
 *
 * schema.org `url` and `item` must be absolute, and WordPress now hands out
 * root-relative breadcrumb paths. Reading the origin from `headers()` would
 * make every page that renders this dynamic, which would undo the static
 * generation work — so it comes from config, with a clear fallback. This is
 * the one place in the app that cannot take the origin from the request.
 */

import { buildJsonLd, serializeJsonLd, type JsonLdInput } from '@/lib/wp/jsonLd';
import { fetchGraphQL } from '@/lib/wp/client';
import { SITE_CACHE } from '@/lib/wp/cacheTags';
import { print } from 'graphql';
import { gql } from '@apollo/client';

const GET_SCHEMA_SITE_DATA = gql`
  query GetSchemaSiteData {
    generalSettings {
      title
      description
    }
    themeGeneralOptions {
      settingsThemeGeneralOptions {
        orgName
        orgSameAs
        orgLogo {
          node {
            sourceUrl
          }
        }
      }
    }
  }
`;

/**
 * Absolute site origin.
 *
 * `NEXT_PUBLIC_SITE_URL` when set. Otherwise Vercel's deployment URL, then
 * localhost — so a dev server still produces parseable JSON-LD rather than
 * relative `url` values that fail validation.
 */
function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (configured) return configured;

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`;

  return 'http://localhost:3000';
}

interface SchemaJsonLdProps {
  node?: JsonLdInput['node'];
  template?: string | null;
  /** Root-relative path, when the node has no `uri` of its own. */
  pathname?: string;
}

export async function SchemaJsonLd({ node, template, pathname }: SchemaJsonLdProps) {
  // Site-level, so it shares the cached site query rather than adding a
  // per-page request. See lib/wp/cacheTags.ts.
  const res = await fetchGraphQL<any>(print(GET_SCHEMA_SITE_DATA), undefined, {
    next: SITE_CACHE,
  }).catch(() => ({ data: null }));

  const orgRaw = res?.data?.themeGeneralOptions?.settingsThemeGeneralOptions ?? null;

  const graphs = buildJsonLd({
    origin: siteOrigin(),
    pathname: node?.uri ?? pathname ?? '',
    siteName: res?.data?.generalSettings?.title ?? null,
    siteDescription: res?.data?.generalSettings?.description ?? null,
    org: orgRaw
      ? {
          orgName: orgRaw.orgName,
          orgSameAs: orgRaw.orgSameAs,
          orgLogo: orgRaw.orgLogo?.node?.sourceUrl ?? null,
        }
      : null,
    node: node ?? null,
    template,
  });

  return (
    <>
      {graphs.map((graph, i) => (
        <script
          key={i}
          type="application/ld+json"
          // serializeJsonLd escapes <, > and & so a value containing
          // "</script>" cannot break out of the element.
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph) }}
        />
      ))}
    </>
  );
}
