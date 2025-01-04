import { getUser, userQueryOptions } from '@/api/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import type { User } from 'backend/src/shared/types'

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData<User | null>({
      queryKey: userQueryOptions().queryKey,
      queryFn: getUser,
    })
    if (!user) {
      throw redirect({ to: '/signin', search: { redirect: location.href } })
    }
  },
})

function ProtectedLayout() {
  return <Outlet />
}
