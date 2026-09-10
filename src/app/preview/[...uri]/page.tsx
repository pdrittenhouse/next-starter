/**
 * Preview rendering route.
 *
 * Reached via `/preview` (see ../route.ts), which redeems the single-use code,
 * stores the preview token in an httpOnly cookie, and redirects here.
 *
 * Exists as its own route so the catch-all does not have to read cookies.
 * Anything calling `cookies()` or `draftMode()` is dynamic for every request,
 * which is what previously kept `/[[...uri]]` off the static path despite it
 * having `generateStaticParams` and `revalidate`. Preview is inherently
 * per-request; published content is not, and they should not share that fate.
 *
 * Markup comes from the same `NodeRenderer` the catch-all uses, so a draft
 * renders identically to how it will once published.
 *
 * A required catch-all (`[...uri]`, not `[[...uri]]`) deliberately: the
 * optional form would also match `/preview` itself and collide with the route
 * handler that lives there.
 */

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { print } from 'graphql';
import type { Metadata } from 'next';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_PREVIEW_POST } from '@/lib/wp/queries';
import { previewHeaders, PREVIEW_COOKIE } from '@/lib/wp/previewSession';
import { NodeRenderer } from '@/stories/templates/partials/node-renderer';
import { normalizeWpNode } from '@/lib/wp/utils/rewriteWpHtml';

/** Never cached, never prerendered — drafts are per-user and change constantly. */
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ uri: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function loadPreviewNode(previewId: string | undefined) {
  if (!previewId) return null;

  const token = (await cookies()).get(PREVIEW_COOKIE)?.value;
  if (!token) return null;

  const { data, errors } = await fetchGraphQL<{ contentNode: any }>(
    print(GET_PREVIEW_POST),
    { id: previewId, idType: 'DATABASE_ID' },
    { headers: previewHeaders(token) },
  );

  if (errors?.length) {
    console.error('[preview] GraphQL errors fetching preview content:', errors);
  }

  // Same normalisation the published fetchers apply — a draft must render
  // identically to how it will once published.
  return normalizeWpNode(data?.contentNode ?? null);
}

export default async function PreviewPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const node = await loadPreviewNode(firstParam(resolved?.preview_id));

  if (!node) {
    // No token, an expired token, or content this user may not see. 404 rather
    // than a redirect so a stale preview tab is obvious instead of silently
    // showing published content.
    notFound();
  }

  return <NodeRenderer node={node} isHomepage={false} searchParams={resolved} />;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const node = await loadPreviewNode(firstParam(resolved?.preview_id));

  const title = node?.seo?.title || node?.title || 'Preview';

  return {
    title: `[Preview] ${title}`,
    // Drafts must never be indexed, whatever the node's own SEO settings say.
    robots: { index: false, follow: false },
  };
}
