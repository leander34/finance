'use client'
import { CircleUserRound, type LucideIcon, Ticket } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { type ComponentProps, type ReactNode, useMemo } from 'react'

import { LinkWithSlug } from '@/components/global/link-with-slug'
import { cn } from '@/lib/utils'

interface LayoutConfiguracaoProps {
  children: ReactNode
}
export default function LayoutConfiguracao({
  children,
}: LayoutConfiguracaoProps) {
  return (
    <div className="flex gap-10">
      <SettingsSidebar />
      <div>{children}</div>
    </div>
  )
}

function SettingsSidebar() {
  return (
    <aside className="sticky left-0 top-0 h-[calc(100vh_-_var(--header-height)_-_100px)] w-[260px] pl-8 pt-10">
      <nav className="flex flex-col gap-1">
        <MenuItem href="/configuracoes/minha-conta" icon={CircleUserRound}>
          Minha conta
        </MenuItem>

        <MenuItem href="/configuracoes/assinaturas" icon={Ticket}>
          Assinaturas
        </MenuItem>
      </nav>
    </aside>
  )
}

interface MenuItemProps extends ComponentProps<typeof LinkWithSlug> {
  icon: LucideIcon
}
function MenuItem({ icon: Icon, href, children, ...props }: MenuItemProps) {
  const pathname = usePathname()

  const isActive = useMemo(() => {
    return pathname.includes(href.toString())
  }, [pathname, href])
  return (
    <LinkWithSlug
      {...props}
      href={href}
      className={cn(
        'flex items-center text-muted-foreground hover:underline hover:decoration-primary hover:decoration-2 hover:underline-offset-2',
        isActive &&
          'font-medium text-primary underline decoration-primary decoration-2 underline-offset-2',
      )}
    >
      <Icon className={cn('mr-2 size-4 shrink-0 text-muted-foreground')} />
      {children}
    </LinkWithSlug>
  )
}
