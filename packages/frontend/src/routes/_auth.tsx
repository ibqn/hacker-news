import { searchSchema } from '@/validators/search'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { User } from 'backend/src/shared/types'

export const Route = createFileRoute('/_auth')({
  validateSearch: zodSearchValidator(searchSchema),
  component: AuthLayout,
  beforeLoad: ({ context, search }) => {
    const user = context.queryClient.getQueryData<User>(['user'])
    if (user) {
      throw redirect({ to: search.redirect })
    }
  },
})

function AuthLayout() {
  return <Outlet />
}
