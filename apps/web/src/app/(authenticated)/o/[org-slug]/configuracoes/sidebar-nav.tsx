'use client'
import { type LucideIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { LinkWithSlug } from '@/components/global/link-with-slug'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarNavProps extends React.ComponentProps<'nav'> {
  items: {
    href: string
    title: string
    icon: LucideIcon
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const isActive = pathname.includes(item.href.toString())
        return (
          <LinkWithSlug
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              isActive
                ? 'bg-muted hover:bg-muted'
                : 'hover:bg-transparent hover:underline',
              'justify-start',
            )}
          >
            <item.icon
              className={cn('mr-2 size-4 shrink-0 text-muted-foreground')}
            />
            {item.title}
          </LinkWithSlug>
        )
      })}
    </nav>
  )
}
