'use client'
import { Plus } from 'lucide-react'

import { Button } from '../ui/button'
import { useNewTransaction } from './hook'

export function NewTransactionButton() {
  const { handleToggleNewTransactionSheet } = useNewTransaction()
  return (
    <Button
      variant="ghost"
      onClick={handleToggleNewTransactionSheet}
      className="group w-40 bg-muted opacity-90 hover:bg-primary-foreground hover:opacity-100 disabled:cursor-not-allowed"
    >
      <Plus className="mr-2 size-4 shrink-0 rounded-full" />
      <span className="tracking-tight">Novo lançamento</span>
    </Button>
  )
}
