import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { format } from 'date-fns'

export const Route = createRootRoute({
  component: () => (
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
  ),
})
