'use client';

/**
 * Error boundary for everything rendered inside the root layout.
 *
 * Next.js requires this file to be named "error.tsx" and to be a Client
 * Component — it is a React error boundary, which needs the component
 * lifecycle. The visible body lives in
 * `stories/templates/error-boundary.tsx`, shared with `global-error.tsx`.
 *
 * This catches throws from pages, nested layouts and server components below
 * the root layout — the overwhelming majority of failures, including any
 * unhandled WordPress fetch error. The root layout itself is OUTSIDE this
 * boundary; `global-error.tsx` covers that.
 *
 * Before this existed the app had only `not-found.tsx`, so an uncaught throw
 * in a server component produced the framework's own dev overlay in
 * development and a bare, unstyled 500 in production.
 */

import { useEffect } from 'react';
import { ErrorBoundaryBody } from '@/stories/templates/error-boundary';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production `error.message` is already replaced by a digest, so this is
    // mainly a development aid and a hook for a client-side reporter.
    console.error('[error boundary]', error);
  }, [error]);

  return <ErrorBoundaryBody error={error} reset={reset} />;
}
