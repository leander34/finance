'use client'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useMemo, useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
interface MenuItemGroupProps {
  title: string
  children: ReactNode
  icon: LucideIcon
  isCollapsed: boolean
  groupHref?: string
  childrenHrefs?: string[]
}
export function MenuItemGroup({
  title,
  children,
  icon: Icon,
  groupHref,
  childrenHrefs,
  isCollapsed,
}: MenuItemGroupProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const groupHrefIsActive = pathname.includes(groupHref ?? '')

  const someChildrenWithActiveHref = useMemo(() => {
    if (childrenHrefs && childrenHrefs.length > 0) {
      if (childrenHrefs?.some((href) => pathname.includes(href))) {
        return true
      }
      return false
    }
    return false
  }, [childrenHrefs, pathname])

  useEffect(() => {
    if (
      childrenHrefs &&
      childrenHrefs.length > 0 &&
      someChildrenWithActiveHref === false
    ) {
      setIsOpen(false)
    }
  }, [pathname, someChildrenWithActiveHref])

  useEffect(() => {
    if (groupHref && groupHrefIsActive === false) {
      setIsOpen(false)
    }
  }, [groupHrefIsActive, pathname])

  let isGroupActive = isOpen
  if (groupHref) {
    isGroupActive = isOpen || groupHrefIsActive
  }
  return (
    <TooltipProvider>
      <Collapsible
        open={isGroupActive}
        onOpenChange={(value) => {
          const groupHrefExists = !!groupHref
          // console.log('groupHrefExists')
          // console.log(groupHrefExists)
          // console.log(groupHref)
          // console.log(pathname)
          // console.log(!groupHrefIsActive)
          if (groupHrefExists && groupHrefIsActive) return
          if (
            childrenHrefs &&
            childrenHrefs.length > 0 &&
            someChildrenWithActiveHref
          )
            return
          setIsOpen(value)
        }}
        // disabled={groupHrefIsActive}
        className={cn(
          'flex flex-col gap-1',
          isCollapsed && isGroupActive && 'rounded-md bg-accent',
        )}
      >
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <CollapsibleTrigger asChild>
              <TooltipTrigger
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'text-muted-foreground disabled:opacity-100',
                  !isCollapsed && 'flex h-8 w-full justify-start',
                  isCollapsed && 'h-9 w-9',
                )}
              >
                <Icon
                  className={cn('size-4 shrink-0', !isCollapsed && 'mr-2')}
                />
                <span className={cn('text-xs', isCollapsed && 'hidden')}>
                  {title}
                </span>
                <ChevronDown
                  className={cn('ml-auto h-4 w-4', isCollapsed && 'hidden')}
                />
                <span className="sr-only">
                  Abrir/fechar sub menu chamado {title}
                </span>
              </TooltipTrigger>
            </CollapsibleTrigger>
            <TooltipContent side="right" className="flex items-center gap-4">
              {title}
              {/* {label && (
              <span className="ml-auto text-muted-foreground">{label}</span>
            )} */}
            </TooltipContent>
          </Tooltip>
        ) : (
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'text-muted-foreground disabled:opacity-100',
                !isCollapsed && 'flex h-8 w-full justify-start',
                isCollapsed && 'h-9 w-9',
              )}
            >
              <Icon className={cn('size-4 shrink-0', !isCollapsed && 'mr-2')} />
              <span className={cn('text-xs', isCollapsed && 'hidden')}>
                {title}
              </span>
              <ChevronDown
                className={cn('ml-auto h-4 w-4', isCollapsed && 'hidden')}
              />
              <span className="sr-only">
                Abrir/fechar sub menu chamado {title}
              </span>
            </Button>
          </CollapsibleTrigger>
        )}
        <CollapsibleContent
          className={cn('flex flex-col gap-1', !isCollapsed && 'pl-6')}
        >
          {children}
        </CollapsibleContent>
      </Collapsible>
    </TooltipProvider>
  )
}
