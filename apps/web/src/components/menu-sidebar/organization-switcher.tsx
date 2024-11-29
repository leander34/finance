'use client'
import { fakeDelay } from '@saas/core'
import { useQuery } from '@tanstack/react-query'
import { CheckIcon, ChevronsUpDown, Loader2, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { useCookies } from '@/hooks/use-cookies'
import { getOrganizationsHttp } from '@/http/auth/organization/get-organizations-http'
import { cn } from '@/lib/utils'
import { getInitials } from '@/utlis/get-initials'

import { Button, buttonVariants } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Skeleton } from '../ui/skeleton'
interface OrganizationSwitcherProps {
  isCollapsed: boolean
}
export function OrganizationSwitcher({
  isCollapsed,
}: OrganizationSwitcherProps) {
  const [open, setOpen] = useState(false)
  const { currentOrg } = useCookies()
  const { data, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      // await fakeDelay()
      return getOrganizationsHttp()
    },
  })

  const currentOrganization = data?.organizations.find(
    (org) => org.slug === currentOrg,
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={isLoading}>
        <Button
          variant="outline"
          role="combobox"
          aria-label="Selecione uma organização"
          className={cn(
            'hover:bg-transparent',
            !isCollapsed && 'flex h-8 w-full justify-between gap-2',
            isCollapsed && 'h-9 w-9',
          )}
        >
          {isLoading ? (
            <>
              <Skeleton className="size-7 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </>
          ) : currentOrganization ? (
            <>
              <Avatar className="size-7">
                {currentOrganization.avatarUrl && (
                  <AvatarImage
                    src={currentOrganization.avatarUrl}
                    alt={currentOrganization.name}
                    className="grayscale"
                  />
                )}
                <AvatarFallback>
                  {' '}
                  {getInitials(currentOrganization.name)}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn('truncate text-left', isCollapsed && 'hidden')}
              >
                {currentOrganization.name}
              </span>
            </>
          ) : (
            <span className={cn('truncate text-left', isCollapsed && 'hidden')}>
              Selecione uma organização
            </span>
          )}
          {isLoading ? (
            <Loader2
              className={cn(
                'ml-auto size-4 shrink-0 animate-spin text-muted-foreground',
                isCollapsed && 'hidden',
              )}
            />
          ) : (
            <ChevronsUpDown
              className={cn(
                'ml-auto size-4 shrink-0 opacity-50',
                isCollapsed && 'hidden',
              )}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Procurar organização..." />
            <CommandEmpty>Nenhuma organização encontrada.</CommandEmpty>
            <CommandGroup heading="Pessoal">
              {data &&
                data.organizations.map((organization) => (
                  <HoverCard>
                    <CommandItem
                      key={organization.id}
                      className="text-sm"
                      disabled={currentOrganization?.id === organization.id}
                      asChild
                    >
                      <HoverCardTrigger asChild>
                        <Link
                          href={`/organization/${organization.slug}/dashboard`}
                          className={cn(
                            'flex select-auto gap-2',
                            currentOrganization?.id === organization.id &&
                              'font-medium',
                          )}
                        >
                          <Avatar className="h-5 w-5">
                            {organization.avatarUrl && (
                              <AvatarImage
                                src={organization.avatarUrl}
                                alt={organization.name}
                                className="grayscale"
                              />
                            )}
                            <AvatarFallback>
                              {' '}
                              {getInitials(organization.name)}
                            </AvatarFallback>
                          </Avatar>

                          <span className="line-clamp-1">
                            {organization.name}
                          </span>
                          <CheckIcon
                            className={cn(
                              'ml-auto h-5 w-5',
                              currentOrganization?.id === organization.id
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                        </Link>
                      </HoverCardTrigger>
                    </CommandItem>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <Avatar>
                          <AvatarImage src="https://github.com/vercel.png" />
                          <AvatarFallback>VC</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">@nextjs</h4>
                          <p className="text-sm">
                            The React Framework – created and maintained by
                            @vercel.
                          </p>
                          <div className="flex items-center pt-2">
                            {/* <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{' '} */}
                            <span className="text-xs text-muted-foreground">
                              Joined December 2021
                            </span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          {/* <CommandList>
            <CommandGroup>
              <DialogTrigger asChild>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    setShowNewTeamDialog(true)
                  }}
                >
                  <PlusCircledIcon className="mr-2 h-5 w-5" />
                  Create Team
                </CommandItem>
              </DialogTrigger>
            </CommandGroup>
          </CommandList> */}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
