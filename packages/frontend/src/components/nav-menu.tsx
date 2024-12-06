import { getSignout, userQueryOptions } from '@/lib/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { queryClient } from '@/query-client'

export type Props = {
  navProps?: ComponentProps<'nav'>
  ulProps?: ComponentProps<'ul'>
}

type NavLinks = {
  name: string
  href: ComponentProps<typeof Link>['to']
}

const links: NavLinks[] = [
  { name: 'new', href: '/about' },
  { name: 'top', href: '/about' },
  { name: 'submit', href: '/about' },
]

export const NavMenu = ({ navProps = {}, ulProps = {} }: Props) => {
  const { data: user } = useQuery(userQueryOptions())

  const { mutate: signout } = useMutation({
    mutationFn: getSignout,
    onSuccess: async () => {
      queryClient.setQueryData(['user'], null)
    },
    onError: () => {
      queryClient.setQueryData(['user'], null)
    },
  })

  return (
    <nav {...navProps}>
      <ul {...ulProps}>
        {links.map((link, index) => (
          <li key={index}>
            <Link to={link.href} className="hover:underline">
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
          <Link to="/signin">Sign in</Link>
        </Button>
      )}
    </nav>
  )
}
