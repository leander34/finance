import { ChevronDown, Crown, User, UserRound } from 'lucide-react'

import { getUserProfileServer } from '@/auth/session-server-only'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/utlis/get-initials'

import { SignOutButton } from './sign-out-button'
export async function UserButton() {
  const { user } = await getUserProfileServer()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 items-center gap-2 rounded-md">
        <div className="flex flex-col items-end">
          <div className="flex items-center">
            <span className="text-sm font-medium capitalize">
              {user.name?.split(' ')[0].toLowerCase()}{' '}
              {user.name?.split(' ')[1].toLowerCase()}
            </span>
            {user.subscription.resolvedActivePlan === 'PREMIUM' && (
              <Crown className="ml-2 size-4 text-primary" />
            )}
          </div>
          <span className="truncate text-xs leading-none text-muted-foreground">
            {user.email}
          </span>
        </div>
        {/* <Avatar className="size-7 rounded-[7px] bg-primary">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
          <AvatarFallback className="bg-primary text-secondary">
            {getInitials(user.name ?? user.email)}
          </AvatarFallback>
        </Avatar> */}
        <Avatar className="h-8 w-8">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
          <AvatarFallback className="">
            {getInitials(user.name ?? user.email)}
          </AvatarFallback>
        </Avatar>
        {/* <ChevronDown className="ml-2 size-4 text-muted-foreground" /> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
