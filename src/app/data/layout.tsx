import { Provider } from '@/utils/ApolloClientProvider';

/**
 * Apollo Provider scoped to the /data debug page.
 * The Dynamic* components on that page use useQuery/useApolloClient,
 * so the Provider must be in their ancestor tree.
 *
 * Keeping it here (rather than the root layout) prevents the Apollo
 * client bundle from loading on every content page.
 */
export default function DataLayout({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
