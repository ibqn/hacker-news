// Import the generated route tree
import { createRouter } from '@tanstack/react-router'
import { routeTree } from '@/route-tree.gen'
import { queryClient } from '@/query-client'
import { Loading } from '@/components/ui/loading'

// Create a new router instance
export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPendingComponent: Loading,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
