// Import the generated route tree
import { createRouter } from '@tanstack/react-router'
import { routeTree } from '@/route-tree.gen'
import { queryClient } from '@/query-client'
import { Loading } from '@/components/loading'
import { NotFound } from '@/components/not-found'
import { ErrorView } from '@/components/error-view'

// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: { queryClient },
  defaultPendingComponent: Loading,
  defaultNotFoundComponent: NotFound,
  defaultErrorComponent: ({ error }) => <ErrorView error={error} />,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
