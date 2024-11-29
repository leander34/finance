'use client'
import { LogOut } from 'lucide-react'
import type { ComponentProps } from 'react'

import { signOut } from '@/actions/auth'
import { cn } from '@/lib/utils'

import { Button } from '../ui/button'
interface SignOutButtonProps extends ComponentProps<typeof Button> {}
export function SignOutButton({ ...props }: SignOutButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      {...props}
      className={cn(
        'flex w-full cursor-pointer justify-start text-muted-foreground',
      )}
      onClick={async () => {
        await signOut()
      }}
    >
      <LogOut className="mr-2 size-4 " />
      Sair
    </Button>
  )
}
