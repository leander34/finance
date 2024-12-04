'use client'
import { Crown, LucideIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { FC, useEffect, useMemo, useState } from 'react'

import { buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { LinkWithSlug } from '../global/link-with-slug'

interface NavItemProps {
  plan?: string
  premium?: boolean
  className?: string
  href: string
  title: string
  label?: string
  icon: LucideIcon
  isCollapsed?: boolean
  onClick?: () => void
}
export const MenuItem: FC<NavItemProps> = ({
  href,
  title,
  label,
  icon: Icon,
  isCollapsed = false,
  onClick,
  premium = false,
}) => {
  const [isMounted, setIsMounted] = useState(false)

  const pathname = usePathname()

  const isActive = useMemo(() => {
    return pathname.includes(href)
  }, [pathname, href])

  useEffect(() => {
    if (isMounted === false) {
      setIsMounted(true)
    }
  }, [isMounted])

  if (isMounted === false) {
    return null
  }
  const variant = isActive ? 'default' : 'ghost'
  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <LinkWithSlug
              href={href}
              className={cn(
                buttonVariants({ variant, size: 'icon' }),
                'h-9 w-9',
                variant === 'default' &&
                  'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white',
                isActive === false && 'text-muted-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="sr-only">{title}</span>
            </LinkWithSlug>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {title}
            {label && (
              <span className="ml-auto text-muted-foreground">{label}</span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <LinkWithSlug
      onClick={() => onClick && onClick()}
      href={href}
      className={cn(
        buttonVariants({ variant, size: 'sm' }),
        variant === 'default' &&
          'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white',
        'justify-start',
        isActive === false && 'text-muted-foreground',
      )}
    >
      <Icon className="mr-2 size-4 shrink-0" />
      {title}
      {label && (
        <span
          className={cn(
            'ml-auto',
            variant === 'default' && 'text-background dark:text-white',
          )}
        >
          {label}
        </span>
      )}
      {/* {plan && (
        <Badge variant="plan" className={cn('ml-auto')}>
          {plan}
        </Badge>
      )} */}
      {premium && <Crown className="ml-auto size-4 text-primary" />}
    </LinkWithSlug>
  )
}
