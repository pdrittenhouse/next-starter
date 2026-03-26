/**
 * Exit preview mode.
 * Disables draftMode and redirects to the homepage (or a provided path).
 */
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const draft = await draftMode();
  draft.disable();
  redirect(searchParams.get('redirect') || '/');
}
