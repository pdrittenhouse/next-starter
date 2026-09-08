/**
 * Preview session handling for the headless front end.
 *
 * Pairs with `Timberland\Framework\HeadlessPreview` on the WordPress side.
 *
 * Flow:
 *   1. WordPress's Preview button sends the editor to `/preview/?code=…&id=…`.
 *      The code is single-use, expires in 60 seconds, and is bound to the user
 *      who clicked.
 *   2. `exchangeCode()` POSTs it, with the shared secret, to
 *      `/wp-json/timberland/v1/preview/exchange` and gets a preview token.
 *   3. The token goes into an httpOnly cookie — never readable from client JS.
 *   4. Subsequent GraphQL requests send it as `X-Timberland-Preview-Token`, so
 *      WordPress resolves them as the previewing editor and applies that
 *      user's real capabilities.
 *
 * This replaces authenticating previews with a single shared application
 * password, under which every preview ran as one fixed account — so draft
 * visibility and capability checks did not reflect the actual editor.
 *
 * WP_PREVIEW_SECRET must match TIMBERLAND_PREVIEW_SECRET in wp-config.php, and
 * is deliberately NOT `NEXT_PUBLIC_`-prefixed: that prefix inlines a value into
 * client bundles, and this must stay server-side.
 */

import { getWpConfig } from '@/lib/wp/config';

/** Cookie holding the preview token. httpOnly, so client JS cannot read it. */
export const PREVIEW_COOKIE = 'wp-preview-token';

export interface PreviewSession {
  token: string;
  expiresIn: number;
  postId: number | null;
  user: { id: number; name: string };
}

function restBase(): string {
  return getWpConfig().graphqlUrl.replace(/\/graphql\/?$/, '');
}

/**
 * Redeem a single-use code for a preview token.
 *
 * Returns null on any failure — an expired code, a secret mismatch, a user
 * without `edit_posts`. Callers should treat null as "not previewing" rather
 * than surfacing an error, since a stale preview link is a normal thing for an
 * editor to click.
 */
export async function exchangeCode(code: string): Promise<PreviewSession | null> {
  const secret = process.env.WP_PREVIEW_SECRET;

  if (!secret) {
    console.error(
      '[preview] WP_PREVIEW_SECRET is not set. It must match TIMBERLAND_PREVIEW_SECRET in wp-config.php.',
    );
    return null;
  }

  try {
    const response = await fetch(`${restBase()}/wp-json/timberland/v1/preview/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, secret }),
      // Never cache a credential exchange.
      cache: 'no-store',
    });

    if (!response.ok) {
      const detail = await response.json().catch(() => null);
      console.error(
        '[preview] code exchange failed:',
        response.status,
        detail?.message ?? response.statusText,
      );
      return null;
    }

    return (await response.json()) as PreviewSession;
  } catch (error) {
    console.error('[preview] code exchange threw:', error);
    return null;
  }
}

/**
 * Headers to attach to a GraphQL request so WordPress resolves it as the
 * previewing user. Empty when there is no preview token.
 */
export function previewHeaders(token: string | undefined): Record<string, string> {
  return token ? { 'X-Timberland-Preview-Token': token } : {};
}
