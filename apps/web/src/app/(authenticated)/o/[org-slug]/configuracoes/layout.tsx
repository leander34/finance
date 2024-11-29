'use client'
import { CircleUserRound, type LucideIcon, Ticket } from 'lucide-react'
// import type { Metadata } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  type ComponentProps,
  type ComponentType,
  type ReactNode,
  useMemo,
} from 'react'

import { LinkWithSlug } from '@/components/global/link-with-slug'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
// export const metadata: Metadata = {
//   title: 'Forms',
//   description: 'Advanced form example using react-hook-form and Zod.',
// }
const sidebarNavItems = [
  {
    title: 'Minha conta',
    href: '/configuracoes/minha-conta',
    icon: CircleUserRound,
  },
  {
    title: 'Assinaturas',
    href: '/configuracoes/assinaturas',
    icon: Ticket,
  },
  // {
  //   title: 'Notificações',
  //   href: '/examples/forms/notifications',
  // },
  // {
  //   title: 'Aparência',
  //   href: '/examples/forms/display',
  // },
]
interface LayoutConfiguracaoProps {
  children: ReactNode
}
export default function LayoutConfiguracao({
  children,
}: LayoutConfiguracaoProps) {
  return (
    <div className="hidden space-y-6 pb-16 md:block">
      {/* <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta.
        </p>
      </div>
      <Separator className="my-6" /> */}
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
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
