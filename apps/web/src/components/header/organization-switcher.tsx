import { CheckIcon, ChevronDown } from 'lucide-react'
import Link from 'next/link'

import { getCurrentOrganizationSlug } from '@/auth/session-server-only'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { getOrganizationsHttp } from '@/http/auth/organization/get-organizations-http'
import { cn } from '@/lib/utils'
import { getInitials } from '@/utlis/get-initials'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
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

export async function OrganizationSwitcher() {
  const currentOrg = getCurrentOrganizationSlug()
  const { organizations } = await getOrganizationsHttp()

  const currentOrganization = organizations?.find(
    (org) => org.slug === currentOrg,
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          role="combobox"
          aria-label="Selecione uma organização"
          className={cn(
            'flex w-[320px] justify-between gap-2 hover:bg-transparent',
          )}
        >
          {currentOrganization ? (
            <>
              <Avatar className="size-7 rounded-[7px] bg-primary">
                {currentOrganization.avatarUrl && (
                  <AvatarImage
                    src={currentOrganization.avatarUrl}
                    alt={currentOrganization.name}
                    className="grayscale"
                  />
                )}
                <AvatarFallback className="bg-primary text-secondary">
                  {' '}
                  {getInitials(currentOrganization.name)}
                </AvatarFallback>
              </Avatar>
              <span className={cn('truncate text-left')}>
                {currentOrganization.name}
              </span>
              <Badge variant="plan">Free</Badge>
            </>
          ) : (
            <span className={cn('truncate text-left')}>
              Selecione uma organização
            </span>
          )}

          <ChevronDown className={cn('ml-auto size-4 shrink-0 opacity-50')} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Procurar organização..." />
            <CommandEmpty>Nenhuma organização encontrada.</CommandEmpty>
            <CommandGroup heading="Pessoal">
              {organizations?.map((organization) => (
                <HoverCard key={organization.id}>
                  <CommandItem
                    className="text-sm"
                    disabled={currentOrganization?.id === organization.id}
                    asChild
                  >
                    <HoverCardTrigger asChild>
                      <Link
                        href={`/o/${organization.slug}/dashboard`}
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
