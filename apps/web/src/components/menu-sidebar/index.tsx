'use client'
import type { PlanNamesType, ResolvedPlanNamesType } from '@saas/core'
import { setCookie } from 'cookies-next'
import { Text } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { Button } from '../ui/button'
import { MenuSidebarNav } from './menu-sidebar-nav'
interface MenuSidebarProps {
  defaultCollpsed?: boolean
  currentPlan: PlanNamesType
  resolvedActivePlan: ResolvedPlanNamesType
}
export function MenuSidebar({
  defaultCollpsed = true,
  currentPlan,
  resolvedActivePlan,
}: MenuSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollpsed)
  function toggleCollapseMenu() {
    const newValue = !isCollapsed
    setIsCollapsed(newValue)
    setCookie('collapsed-menu-sidebar', newValue)
  }
  return (
    <aside
      className={cn(
        'relative w-72 border-r',
        isCollapsed &&
          'min-w-[52px] max-w-fit transition-all duration-300 ease-in-out',
      )}
    >
      <div className="flex h-header-height items-center gap-2 px-2">
        {/* <OrganizationSwitcher isCollapsed={isCollapsed} /> */}

        <Button
          // className="border-none bg-transparent text-muted-foreground shadow-none hover:bg-transparent"
          className="rounded-[7px] text-foreground shadow-none hover:text-primary"
          size="icon"
          variant="ghost"
          onClick={toggleCollapseMenu}
        >
          <Text className="size-6" />
        </Button>
        <h1
          className={cn(
            'text-3xl font-semibold text-primary',
            isCollapsed && 'hidden',
          )}
        >
          Finance.
        </h1>
      </div>
      {/* <Separator /> */}
      <MenuSidebarNav
        resolvedActivePlan={resolvedActivePlan}
        currentPlan={currentPlan}
        isCollapsed={isCollapsed}
      />
    </aside>
  )
}
