'use client'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { type ComponentProps, type FC, useMemo } from 'react'

import { LinkWithSlug } from '@/components/global/link-with-slug'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
export const TabsAccounts = () => {
  return (
    <Tabs defaultValue="my-accounts" className="">
      <TabsList>
        <TabItem value="/contas-financeiras">Minhas contas</TabItem>
        <TabItem value="/contas-financeiras/relatorios">Relatórios</TabItem>
      </TabsList>
    </Tabs>
  )
}

interface TabItemProps extends ComponentProps<typeof TabsTrigger> {}
const TabItem: FC<TabItemProps> = ({ value, children }) => {
  const pathname = usePathname()
  const isActive = useMemo(() => {
    return pathname.endsWith(value)
  }, [pathname, value])
  console.log(value, isActive)
  return (
    <TabsTrigger
      value={value}
      data-state={false}
      className={cn(
        'relative min-w-[240px] text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-muted-foreground data-[state=active]:shadow-none',
        isActive && 'text-primary shadow',
      )}
      style={{
        WebkitTapHighlightColor: 'transparent',
      }}
      asChild
    >
      <LinkWithSlug href={value}>
        <span className="z-20">{children}</span>
        {isActive && (
          <motion.span
            layoutId="bubble"
            className="absolute inset-0 z-10 bg-background"
            style={{ borderRadius: 9999 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
      </LinkWithSlug>
    </TabsTrigger>
  )
}
