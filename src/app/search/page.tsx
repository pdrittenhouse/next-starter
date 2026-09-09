/**
 * Search results route — dynamic.
 *
 * WordPress search URLs are `/?s=query`, which would force the site root to be
 * dynamic. The proxy rewrites those here instead, so the public URL is
 * unchanged while `/[[...uri]]` stays prerenderable.
 */

import type { Metadata } from 'next';
import { SearchTemplate } from '@/stories/templates/search';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

export default async function SearchPage({ searchParams }: PageProps) {
  const resolved = await searchParams;

  return <SearchTemplate query={firstParam(resolved?.s)} searchParams={resolved} />;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const query = firstParam(resolved?.s);

  return {
    title: query ? `Search results for "${query}"` : 'Search',
    // Search result pages should not be indexed.
    robots: { index: false, follow: true },
  };
}
