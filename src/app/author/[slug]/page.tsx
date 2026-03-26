import { notFound } from 'next/navigation';
import { print } from 'graphql';
import type { Metadata } from 'next';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_USER_BY_SLUG, GET_ALL_USER_SLUGS } from '@/lib/wp/queries';
import { AuthorTemplate } from '@/stories/templates/author';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** ISR — revalidate author pages every 60 seconds. */
export const revalidate = 60;

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;

  const { data } = await fetchGraphQL<{ user: any }>(
    print(GET_USER_BY_SLUG),
    { slug },
  );

  const user = data?.user;
  if (!user) {
    notFound();
  }

  return <AuthorTemplate slug={user.slug} name={user.name} />;
}

export async function generateStaticParams() {
  const { data } = await fetchGraphQL<{
    users: { edges: { node: { slug: string } }[] };
  }>(print(GET_ALL_USER_SLUGS)).catch(() => ({ data: null })) as any;

  const users = data?.users?.edges ?? [];
  return users.map(({ node }: any) => ({ slug: node.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const { data } = await fetchGraphQL<{ user: { name: string } }>(
    print(GET_USER_BY_SLUG),
    { slug },
  );

  return {
    title: data?.user?.name
      ? `Author Archives: ${data.user.name}`
      : 'Author Archives',
  };
}
