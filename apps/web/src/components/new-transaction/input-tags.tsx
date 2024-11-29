import { PlusCircledIcon } from '@radix-ui/react-icons'
import { CheckIcon, Circle, CircleDashed } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

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
import { Separator } from '../ui/separator'

const options = [
  {
    id: '1',
    value: 'Mercado livre',
  },
]
export function InputTags() {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    new Set(['Mercado livre']),
  )
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex h-8 w-full justify-start border-dashed"
        >
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          Tags
          {selectedTags?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              {/* <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge> */}
              <div className="hidden space-x-1 lg:flex">
                {options
                  .filter((option) => selectedTags.has(option.value))
                  .map((option) => (
                    <Badge
                      variant="secondary"
                      key={option.value}
                      className="rounded-sm px-1 font-normal"
                    >
                      {option.value}
                    </Badge>
                  ))}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="oisas" />
          <CommandList>
            <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedTags.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedTags.delete(option.value)
                      } else {
                        selectedTags.add(option.value)
                      }
                      setSelectedTags(selectedTags)
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <CheckIcon className={cn('h-4 w-4')} />
                    </div>
                    <CircleDashed className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{option.value}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {/* {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Limpar tags
                  </CommandItem>
                </CommandGroup>
              </>
            )} */}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
