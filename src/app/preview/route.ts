/**
 * Preview entry point.
 *
 * WordPress's Preview button lands here — `Timberland\Framework\HeadlessPreview`
 * filters `preview_post_link` to `{TIMBERLAND_HEADLESS_URL}/preview/?code=…&id=…`.
 *
 * This handler:
 *   1. redeems the single-use code for a preview token,
 *   2. stores the token in an httpOnly cookie,
 *   3. enables Next's draftMode so the catch-all knows to render drafts,
 *   4. redirects to the post's real URI.
 *
 * Rendering happens in the catch-all rather than here, so preview reuses the
 * same template-resolution tree as published content instead of duplicating it.
 *
 * Replaces the previous `/api/preview?secret=…` flow, where the shared secret
 * travelled in the URL and every preview authenticated as one fixed account.
 */

import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_PREVIEW_POST } from '@/lib/wp/queries';
import { exchangeCode, previewHeaders, PREVIEW_COOKIE } from '@/lib/wp/previewSession';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const id = searchParams.get('id');

  if (!code) {
    return new Response('Missing preview code', { status: 400 });
  }

  const session = await exchangeCode(code);
  if (!session) {
    // Most often an expired or already-redeemed code — an editor re-opening an
    // old preview tab. 403 rather than a redirect, so the cause is visible.
    return new Response(
      'Preview link is invalid or has expired. Click Preview again in the editor.',
      { status: 403 },
    );
  }

  const postId = id ?? (session.postId != null ? String(session.postId) : null);
  if (!postId) {
    return new Response('Missing post ID', { status: 400 });
  }

  // Resolve the target URI as the previewing user, so an unpublished draft — which
  // is invisible to an anonymous request — is found.
  const { data, errors } = await fetchGraphQL<{ contentNode: { uri?: string; slug?: string } | null }>(
    print(GET_PREVIEW_POST),
    { id: postId, idType: 'DATABASE_ID' },
    { headers: previewHeaders(session.token) },
  );

  if (errors?.length) {
    console.error('[preview] GraphQL errors resolving the preview target:', errors);
  }

  const post = data?.contentNode;
  if (!post) {
    return new Response('Preview content not found', { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set(PREVIEW_COOKIE, session.token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    // Match the token's own lifetime so the cookie cannot outlive it.
    maxAge: session.expiresIn,
    secure: process.env.NODE_ENV === 'production',
  });

  const draft = await draftMode();
  draft.enable();

  redirect(buildPreviewTarget(post, postId));
}

/**
 * Build the URL to redirect a preview to.
 *
 * Deliberately defensive about `post.uri`:
 *
 *  - It may be absolute, or carry its own query string. WordPress derives a
 *    revision's permalink from its preview link, so `uri` can come back as a
 *    full preview URL rather than a path. Naive string concatenation of
 *    `?preview_id=` then produced `…/preview/?code=…&id=1?preview_id=1`, which
 *    pointed straight back at this route — an unbounded redirect loop.
 *    (The framework now also refuses to rewrite preview links during a GraphQL
 *    request, which removes the cause; this keeps the symptom impossible.)
 *
 *  - It may be missing entirely for a never-published draft, hence the slug
 *    fallback. The catch-all resolves content by `preview_id`, so the path only
 *    has to be routable, not correct.
 *
 * Always returns a root-relative path with a single, well-formed query.
 */
function buildPreviewTarget(post: { uri?: string; slug?: string }, postId: string): string {
  const raw = post.uri || (post.slug ? `/${post.slug}/` : '/');

  // Parse against a dummy origin so absolute and relative inputs behave alike.
  let parsed: URL;
  try {
    parsed = new URL(raw, 'http://placeholder.invalid');
  } catch {
    parsed = new URL('/', 'http://placeholder.invalid');
  }

  // Drop any inherited query — a preview link's own code must not survive here.
  const target = new URL(parsed.pathname, 'http://placeholder.invalid');
  target.searchParams.set('preview_id', postId);

  // Render under /preview/ rather than the real path, so the catch-all never
  // has to read a cookie and can stay on the static path.
  const path = target.pathname === '/' ? '/preview/home' : `/preview${target.pathname}`;

  return `${path}${target.search}`;
}
