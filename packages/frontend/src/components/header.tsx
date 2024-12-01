import { Link } from '@tanstack/react-router'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { MenuIcon } from 'lucide-react'
import { NavMenu } from '@/components/nav-menu'

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-border/40 bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/90">
      <div className="container mx-auto flex items-center justify-between p-4 text-primary-foreground">
        <div className="flex grow items-center space-x-4">
          <Link to="/" className="justify-between font-bold">
            hacker news
          </Link>

          <NavMenu
            navProps={{
              className:
                'hidden items-center grow justify-between md:flex text-sm',
            }}
            ulProps={{ className: 'flex space-x-4' }}
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="flex size-6 md:hidden"
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent className="mb-2 space-y-2">
            <SheetHeader>
              <SheetTitle>hacker news</SheetTitle>
              <SheetDescription className="sr-only">
                Navigation
              </SheetDescription>
            </SheetHeader>

            <NavMenu
              navProps={{ className: 'flex flex-col gap-4 text-sm' }}
              ulProps={{
                className: 'flex flex-col space-y-2',
              }}
            />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
