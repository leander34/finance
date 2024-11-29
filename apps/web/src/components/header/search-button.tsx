'use client'
import { BarChartBig, Handshake, Palette, Search, Users2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useCookies } from '@/hooks/use-cookies'
export const SearchButton = () => {
  const { orgSlug } = useCookies()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleRedirect = (to: string) => {
    console.log(to)
    // router.push(`/${companyCode}${to}`)
    setOpen(false)
  }
  return (
    <>
      <Button
        onClick={() => setOpen(!open)}
        className="relative flex w-full max-w-xs items-center justify-between sm:w-60 sm:max-w-none"
        variant="outline"
        size="sm"
      >
        <Search className="size-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Procurar na plataforma...
        </span>
        {/* <span className="hidden sm:inline-flex">Procurar na plataforma...</span> */}
        {/* <span className="inline-flex sm:hidden">Procurar...</span> */}
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-semibold text-muted-foreground opacity-100 sm:flex">
          <span>⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Procurar na plataforma..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Sugestões">
            <CommandItem
              value="/dashboard"
              onSelect={handleRedirect}
              className="cursor-pointer"
            >
              <BarChartBig className="mr-2 h-3 w-3" strokeWidth={1.4} />
              <span className="text-xs font-medium">Dashboard</span>
            </CommandItem>
            <CommandItem
              value="/clientes"
              onSelect={handleRedirect}
              className="cursor-pointer"
            >
              <Users2 className="mr-2 h-3 w-3" strokeWidth={1.4} />
              <span className="text-xs font-medium">Clientes</span>
            </CommandItem>
            <CommandItem
              value="/operacoes"
              onSelect={handleRedirect}
              className="cursor-pointer"
            >
              <Handshake className="mr-2 h-3 w-3" strokeWidth={1.4} />
              <span className="text-xs font-medium">Operações</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Configurações">
            <CommandItem
              value="/configuracoes/aparencia"
              onSelect={handleRedirect}
              className="cursor-pointer"
            >
              <Palette className="mr-2 h-3 w-3" strokeWidth={1.4} />
              <span className="text-xs font-medium">Aparência</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
