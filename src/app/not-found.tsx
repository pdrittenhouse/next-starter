/**
 * Next.js requires this file to be named "not-found.tsx" — it's a framework convention.
 * The actual 404 template lives at src/stories/templates/404.tsx (matching the WP theme).
 */
import { NotFoundTemplate } from '@/stories/templates/404';

export default function NotFound() {
  return <NotFoundTemplate />;
}
