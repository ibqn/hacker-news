import { Link } from '@tanstack/react-router'
import { ComponentProps } from 'react'

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
    </nav>
  )
}
