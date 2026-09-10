'use client';

/**
 * Error boundary of last resort: catches throws in the ROOT layout itself.
 *
 * `app/error.tsx` sits inside the root layout, so it cannot catch a failure of
 * that layout — and `app/layout.tsx` fetches global CSS, the spritemap and
 * design tokens from WordPress, which makes a root-layout throw a realistic
 * failure rather than a theoretical one.
 *
 * Because the root layout did not render, this component must supply its own
 * `<html>` and `<body>`. That is a Next.js requirement specific to
 * `global-error.tsx`, and also why the shared body carries inline styles: the
 * design system's CSS is injected by the layout that just failed.
 */

import { ErrorBoundaryBody } from '@/stories/templates/error-boundary';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>Something went wrong</title>
      </head>
      <body>
        <ErrorBoundaryBody error={error} reset={reset} />
      </body>
    </html>
  );
}
