import { userQueryOptions } from '@/lib/api'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { UserData } from 'backend/src/shared/types'

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
  beforeLoad: async ({ context, location }) => {
    const user =
      await context.queryClient.ensureQueryData<UserData>(userQueryOptions())
    if (!user) {
      throw redirect({ to: '/signin', search: { redirect: location.href } })
    }
  },
})

function ProtectedLayout() {
  return <Outlet />
}
