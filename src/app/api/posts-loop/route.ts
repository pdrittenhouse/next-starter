import { NextResponse } from 'next/server';
import { fetchGraphQL } from '@/lib/wp/client';
import { print } from 'graphql';
import { GET_POSTS_PAGINATED } from '@/lib/wp/queries/posts';

interface RequestBody {
  cursor?: string | null;
  perPage?: number;
  categoryId?: number | null;
  tagId?: string | null;
  authorName?: string | null;
  search?: string | null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const { cursor = null, perPage = 10, categoryId = null, tagId = null, authorName = null, search = null } = body;

    const result = await fetchGraphQL<{
      posts: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        edges: Array<{ node: Record<string, unknown> }>;
      };
    }>(print(GET_POSTS_PAGINATED), {
      first: Math.min(Number(perPage) || 10, 100),
      after: cursor ?? null,
      categoryId: categoryId ? Number(categoryId) : undefined,
      tagId: tagId ?? undefined,
      authorName: authorName ?? undefined,
      search: search ?? undefined,
    });

    const nodes = result.data?.posts?.edges?.map(e => e.node) ?? [];
    const pageInfo = result.data?.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };

    return NextResponse.json({ nodes, pageInfo });
  } catch (e) {
    return NextResponse.json(
      { error: String(e), nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
      { status: 500 },
    );
  }
}
