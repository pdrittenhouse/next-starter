/**
 * schema.org JSON-LD construction.
 *
 * Mirrors `templates/partials/wrapper/schema.twig`, which emits up to five
 * graphs per page:
 *
 *   WebSite          always, with a SearchAction pointing at the search route
 *   Organization     when the `org_name` theme option is set
 *   Article          singular post
 *   WebPage          singular page
 *   CollectionPage   archives
 *   BreadcrumbList   when a visible breadcrumb trail exists
 *
 * Built here as plain objects rather than interpolated into a template string,
 * which is what the Twig version does. Hand-built JSON has to escape values for
 * a JS string context (`| escape('js')` in the Twig) and gets it wrong the
 * moment a title contains a quote or a newline; `JSON.stringify` cannot make
 * that mistake. The remaining escape concern is `</script>` inside a value,
 * handled by `serializeJsonLd`.
 *
 * ─── Absolute URLs ─────────────────────────────────────────────────────────
 *
 * schema.org `url` and `item` must be absolute. WordPress now hands out
 * root-relative paths for breadcrumbs (see `Revalidation` and
 * `GraphQL::relative_url`), so the origin is applied here, taken from the
 * request rather than config — the same reasoning as the sitemap, where a
 * hard-coded host means a staging deploy advertises production URLs.
 */

export interface BreadcrumbCrumb {
  label?: string | null;
  url?: string | null;
  isCurrentPage?: boolean | null;
}

export interface JsonLdInput {
  /** Absolute front-end origin, no trailing slash. */
  origin: string;
  /** Path of the page being rendered, root-relative. */
  pathname: string;
  siteName?: string | null;
  siteDescription?: string | null;
  /** Theme general options: orgName / orgLogo / orgSameAs. */
  org?: {
    orgName?: string | null;
    orgLogo?: { url?: string | null } | string | null;
    orgSameAs?: string | null;
  } | null;
  /** The content node, when the page represents one. */
  node?: {
    title?: string | null;
    uri?: string | null;
    date?: string | null;
    modified?: string | null;
    contentTypeName?: string | null;
    author?: { node?: { name?: string | null } | null } | null;
    featuredImage?: { node?: { sourceUrl?: string | null } | null } | null;
    breadcrumbs?: BreadcrumbCrumb[] | null;
  } | null;
  /** Which template rendered, so archives can emit CollectionPage. */
  template?: string | null;
}

type Graph = Record<string, unknown>;

/** Absolute URL from a root-relative path. Leaves absolute input alone. */
function absolute(origin: string, path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Templates that represent a listing rather than a single item.
 *
 * Mirrors the Twig `is_archive()` branch. `search` is included because a search
 * results page is a collection too, even though WordPress reports it
 * separately.
 */
const COLLECTION_TEMPLATES = new Set([
  'archive',
  'archive-cpt',
  'author',
  'date-archive',
  'search',
  'home',
]);

export function buildJsonLd(input: JsonLdInput): Graph[] {
  const { origin, pathname, siteName, siteDescription, org, node, template } = input;
  const graphs: Graph[] = [];

  // ── WebSite ──
  const website: Graph = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName ?? '',
    url: origin,
    potentialAction: {
      '@type': 'SearchAction',
      // `/search?s=` rather than Twig's `/?s=` because middleware rewrites the
      // WordPress-style query to the app's own search route, and a crawler
      // should be pointed at the URL that actually renders.
      target: `${origin}/search?s={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  if (siteDescription) website.description = siteDescription;
  graphs.push(website);

  // ── Organization ──
  const orgName = org?.orgName?.trim();
  if (orgName) {
    const organization: Graph = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: orgName,
      url: origin,
    };

    const logoUrl = typeof org?.orgLogo === 'string' ? org.orgLogo : org?.orgLogo?.url;
    if (logoUrl) organization.logo = logoUrl;

    // The ACF field is a textarea, one URL per line — same split as the Twig.
    const sameAs = (org?.orgSameAs ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (sameAs.length) organization.sameAs = sameAs;

    graphs.push(organization);
  }

  // ── The page itself ──
  const isCollection = COLLECTION_TEMPLATES.has(template ?? '');

  if (isCollection) {
    graphs.push({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      url: absolute(origin, pathname),
    });
  } else if (node) {
    const url = absolute(origin, node.uri ?? pathname);
    const image = node.featuredImage?.node?.sourceUrl ?? undefined;

    if (node.contentTypeName === 'post') {
      const article: Graph = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: node.title ?? '',
        url,
      };
      // WordPress returns site-local time with no zone. Passing it through
      // unchanged keeps it consistent with what the sitemap and the rest of the
      // app report, rather than inventing a UTC offset.
      if (node.date) article.datePublished = node.date;
      if (node.modified) article.dateModified = node.modified;
      if (node.author?.node?.name) {
        article.author = { '@type': 'Person', name: node.author.node.name };
      }
      if (image) article.image = image;
      graphs.push(article);
    } else {
      const webpage: Graph = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: node.title ?? '',
        url,
      };
      if (image) webpage.image = image;
      graphs.push(webpage);
    }
  }

  // ── BreadcrumbList ──
  //
  // Only when there is a real trail. The Twig gates this on a breadcrumb block
  // being present on the page, which is the same intent: BreadcrumbList should
  // describe breadcrumbs the visitor can actually see. A single crumb is not a
  // trail — the front page returns exactly one — so two is the floor, matching
  // the Twig's `crumbs | length > 1`.
  const crumbs = (node?.breadcrumbs ?? []).filter((c) => c?.label);
  if (crumbs.length > 1) {
    graphs.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, i) => {
        const item: Graph = {
          '@type': 'ListItem',
          position: i + 1,
          name: crumb.label,
        };
        // The current page's own crumb deliberately carries no `item`. Google
        // treats a self-referencing last element as valid either way, and
        // omitting it matches the Twig, which only emits `item` when the crumb
        // has a url.
        const absoluteUrl = absolute(origin, crumb.url);
        if (absoluteUrl && !crumb.isCurrentPage) item.item = absoluteUrl;
        return item;
      }),
    });
  }

  return graphs;
}

/**
 * Serialise one graph for embedding in a `<script type="application/ld+json">`.
 *
 * The only sequence that can break out of that element is `</script`, which
 * `JSON.stringify` does not escape because it is valid JSON text. Escaping the
 * `<` as `<` keeps the JSON semantically identical while making the
 * sequence inert in HTML. `-->` and `<!--` are escaped for the same reason.
 */
export function serializeJsonLd(graph: Graph): string {
  return JSON.stringify(graph)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
