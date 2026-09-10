'use client';

/**
 * The visible body of both error boundaries.
 *
 * Shared by `app/error.tsx` (errors inside the layout) and
 * `app/global-error.tsx` (errors in the layout itself), which differ only in
 * whether they render their own `<html>` and `<body>`.
 *
 * ─── Why this fetches nothing ───────────────────────────────────────────────
 *
 * Every other template in this app pulls from WordPress. This one must not: an
 * unreachable or erroring WordPress is the most likely reason a boundary is
 * being rendered at all, so fetching here would mean the error page fails for
 * the same reason the real page did. It is also a client component, where the
 * server-side GraphQL client is not available anyway.
 *
 * Consequently it carries its own styles rather than relying on the design
 * system's global CSS, which arrives from WordPress via `app/layout.tsx`. In
 * `global-error.tsx` that layout has not run, so nothing else would style this.
 * A plain readable page that always renders beats a theme-consistent one that
 * renders only when nothing is wrong.
 */

interface ErrorBoundaryBodyProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const STYLES = `
  .tl-error-root {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 1.5rem;
    background: #fff;
    color: #1a1a1a;
    font: 16px/1.6 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  }
  .tl-error-inner { max-width: 34rem; text-align: center; }
  .tl-error-inner h1 { margin: 0 0 .5rem; font-size: 1.5rem; font-weight: 600; }
  .tl-error-inner p { margin: 0 0 1.5rem; color: #595959; }
  .tl-error-actions { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
  .tl-error-actions button,
  .tl-error-actions a {
    padding: .6rem 1.1rem;
    border: 1px solid #e0e0e0;
    border-radius: .375rem;
    background: none;
    color: inherit;
    font: inherit;
    text-decoration: none;
    cursor: pointer;
  }
  .tl-error-actions button:hover, .tl-error-actions a:hover,
  .tl-error-actions button:focus-visible, .tl-error-actions a:focus-visible { border-color: currentColor; }
  .tl-error-digest { margin-top: 1.5rem; font-size: .8125rem; color: #8c8c8c; }
  @media (prefers-color-scheme: dark) {
    .tl-error-root { background: #141414; color: #f2f2f2; }
    .tl-error-inner p { color: #a6a6a6; }
    .tl-error-actions button, .tl-error-actions a { border-color: #333; }
    .tl-error-digest { color: #737373; }
  }
`;

export function ErrorBoundaryBody({ error, reset }: ErrorBoundaryBodyProps) {
  return (
    <div className="tl-error-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="tl-error-inner">
        <h1>Something went wrong</h1>
        <p>
          We hit an unexpected error while loading this page. It has been logged.
          Trying again may be all that is needed.
        </p>
        <div className="tl-error-actions">
          {/* `reset` re-renders the failed segment without a full page load. */}
          <button type="button" onClick={() => reset()}>
            Try again
          </button>
          <a href="/">Back to the homepage</a>
        </div>
        {/*
          The digest is the only error detail safe to show. Next replaces the
          real message with it in production precisely so stack frames, queries
          and hostnames do not reach the browser — and quoting it lets someone
          match this page to a specific entry in the server log.
        */}
        {error?.digest ? <p className="tl-error-digest">Reference: {error.digest}</p> : null}
      </div>
    </div>
  );
}
