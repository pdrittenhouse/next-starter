/**
 * Exit preview mode.
 *
 * Disables draftMode, clears the preview token cookie, and redirects.
 *
 * Clearing the cookie matters: draftMode alone stops the catch-all taking the
 * preview branch, but leaving the token in place would keep a credential that
 * authenticates as a real user sitting in the browser for up to an hour.
 */
import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { PREVIEW_COOKIE } from '@/lib/wp/previewSession';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const draft = await draftMode();
  draft.disable();

  (await cookies()).delete(PREVIEW_COOKIE);

  redirect(searchParams.get('redirect') || '/');
}
