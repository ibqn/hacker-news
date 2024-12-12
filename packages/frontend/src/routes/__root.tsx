import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'
import { userQueryOptions } from '@/api/auth'
import { queryClient } from '@/query-client'
import { QueryClient, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { format } from 'date-fns'
import { useEffect } from 'react'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Root,
})

function Root() {
  const { error } = useQuery(userQueryOptions())

  useEffect(() => {
    if (error) {
      queryClient.setQueryData(['user'], null)
    }
  }, [error])

  return (
    <>
      <div className="flex min-h-screen flex-col bg-mainground text-foreground">
        <Header />
        <main className="container mx-auto flex grow p-4">
          <Outlet />
        </main>

        <footer className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {format(new Date(), 'yyyy')} hacker news
          </p>
        </footer>
      </div>
      <Toaster />
      <ReactQueryDevtools />
      <TanStackRouterDevtools />
    </>
  )
}
