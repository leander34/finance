import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

import { Input } from '../ui/input'

interface CustomInputValueProps extends ComponentProps<'input'> {}
export const CustomInputNumber = ({
  className,
  disabled,
  ...props
}: CustomInputValueProps) => {
  return (
    <div className="relative">
      <Input {...props} className={cn('pl-8', className)} disabled={disabled} />
      <span
        data-disabled={disabled}
        className="absolute left-2 top-[9px] text-sm text-muted-foreground data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
      >
        R$
      </span>
    </div>
  )
}
