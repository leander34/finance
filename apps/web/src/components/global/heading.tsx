import type { ComponentProps, FC, HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

interface HeadingRootProps extends ComponentProps<'div'> {}

const HeadingRoot: FC<HeadingRootProps> = ({ className, ...props }) => {
  return <div className={cn('', className)} {...props} />
}

interface HeadingTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  headingType?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const HeadingTitle: FC<HeadingTitleProps> = ({
  headingType = 'h1',
  className,
  ...props
}) => {
  const Heading = headingType
  return (
    <Heading
      className={cn(
        'text-2xl font-semibold tracking-tighter antialiased',
        className,
      )}
      {...props}
    />
  )
}

interface HeadingDescriptionProps extends ComponentProps<'p'> {}
const HeadingDescription: FC<HeadingDescriptionProps> = ({
  className,
  ...props
}) => {
  return (
    <p
      className={cn(
        'max-w-2xl text-balance text-sm text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export const Heading = {
  Root: HeadingRoot,
  Title: HeadingTitle,
  Description: HeadingDescription,
}
