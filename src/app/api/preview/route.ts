/**
 * Preview mode API route.
 *
 * WordPress sends users here when they click "Preview" in the editor.
 * Expects: /api/preview?secret=<token>&id=<postId>
 *
 * Enables Next.js draftMode, then redirects to the post's URI.
 */
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_PREVIEW_POST } from '@/lib/wp/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const id = searchParams.get('id');

  // Validate the preview secret
  if (!secret || secret !== process.env.WP_PREVIEW_SECRET) {
    return new Response('Invalid preview secret', { status: 401 });
  }

  if (!id) {
    return new Response('Missing post ID', { status: 400 });
  }

  // Fetch the preview post (authenticated — drafts require auth)
  const { data } = await fetchGraphQL<{ contentNode: any }>(
    print(GET_PREVIEW_POST),
    { id, idType: 'DATABASE_ID' },
    { useAuth: true },
  );

  const post = data?.contentNode;
  if (!post) {
    return new Response('Post not found', { status: 404 });
  }

  // Enable draft mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to the post's URI (or construct from slug)
  const uri = post.uri || `/${post.slug}/`;
  redirect(uri);
}
