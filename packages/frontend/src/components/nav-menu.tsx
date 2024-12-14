import { getSignout, userQueryOptions } from '@/api/auth'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { type ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { queryClient } from '@/query-client'
import type {
  OrderSchema,
  SortedBySchema,
} from 'backend/src/validators/pagination'

export type Props = {
  navProps?: ComponentProps<'nav'>
  ulProps?: ComponentProps<'ul'>
  setOpen?: (open: boolean) => void
}

type NavLinks = {
  name: string
  href: ComponentProps<typeof Link>['to']
  search?: {
    sortedBy?: SortedBySchema
    oder?: OrderSchema
  }
}

const links: NavLinks[] = [
  { name: 'new', href: '/', search: { sortedBy: 'recent' } },
  { name: 'top', href: '/', search: { sortedBy: 'points' } },
  { name: 'submit', href: '/submit' },
]

export const NavMenu = ({ navProps = {}, ulProps = {}, setOpen }: Props) => {
  const { data: user } = useQuery(userQueryOptions())

  const { mutate: signout } = useMutation({
    mutationFn: getSignout,
    onSettled: async () => {
      setOpen?.(false)
      queryClient.setQueryData(['user'], null)
    },
  })

  return (
    <nav {...navProps}>
      <ul {...ulProps}>
        {links.map((link, index) => (
          <li key={index}>
            <Link
              to={link.href}
              search={link.search}
              className="hover:underline"
              onClick={() => setOpen?.(false)}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>

      {user ? (
        <div className="flex items-center gap-4">
          <span>user: {user.username}</span>
          <Button
            size="sm"
            variant="secondary"
            className="bg-secondary-foreground text-primary-foreground hover:bg-secondary-foreground/70"
            onClick={() => signout()}
          >
            Sign out
          </Button>
        </div>
      ) : (
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="bg-secondary-foreground text-primary-foreground hover:bg-secondary-foreground/70"
        >
          <Link to="/signin" onClick={() => setOpen?.(false)}>
            Sign in
          </Link>
        </Button>
      )}
    </nav>
  )
}
