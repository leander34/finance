import type { ComponentProps, FC } from 'react'

import { cn } from '@/lib/utils'
interface PageContentContainerProps extends ComponentProps<'div'> {}
export const PageContentContainer: FC<PageContentContainerProps> = ({
  className,
  ...props
}) => {
  return <div className={cn('space-y-6', className)} {...props} />
}
