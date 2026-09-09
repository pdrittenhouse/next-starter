/**
 * Paginated content route — dynamic.
 *
 * Not linked directly. The proxy rewrites any request carrying an `?after=` or
 * `?before=` cursor here, so the URLs users and WordPress see are unchanged.
 *
 * It exists so `/[[...uri]]` never has to read `searchParams`. Reading
 * searchParams in a route makes it dynamic for every request, which is what
 * previously stopped `generateStaticParams` and `revalidate` from taking effect
 * on the main content route.
 *
 * Cursors are also a poor fit for prerendering on their own terms: WPGraphQL
 * cursors shift as content changes, so a baked-in `?after=` goes stale.
 */

import type { Metadata } from 'next';
import { RouteContent, getNodeByUri, parseDateArchiveUri } from '@/stories/templates/partials/route-content';
import { formatDateArchiveTitle } from '@/app/[[...uri]]/page';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ uri?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PagedPage({ params, searchParams }: PageProps) {
  const { uri: uriSegments } = await params;
  const resolved = await searchParams;

  return <RouteContent uriSegments={uriSegments} searchParams={resolved} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Without this, paginated views fell back to the root layout's default title
  // ("Create Next App") — the catch-all's generateMetadata no longer runs for
  // them, since the proxy rewrites them here.
  const { uri: uriSegments } = await params;
  const uri = uriSegments ? `/${uriSegments.join('/')}/` : '/';

  // Same order as the catch-all: WordPress first, date pattern only if there is
  // no node. Without the date branch a paginated date archive fell back to the
  // bare "Archive" placeholder.
  const node = await getNodeByUri(uri);
  const dateArchive = node ? null : parseDateArchiveUri(uriSegments);
  const title = node?.seo?.title
    || node?.title
    || node?.name
    || (dateArchive ? `Archives: ${formatDateArchiveTitle(dateArchive)}` : 'Archive');

  return {
    title,
    // Paginated views duplicate page-1 content; leave canonical and indexing
    // to page 1.
    robots: { index: false, follow: true },
  };
}
