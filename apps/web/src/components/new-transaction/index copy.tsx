'use client'
import { Loader2, Plus } from 'lucide-react'

import { premiumComponents } from '../requires-subscrition/premium'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { useNewTransaction } from './hook'
interface NewTransactionComponentProps {
  componentAction(): void
  isLoading?: boolean
}

function NewTransactionComponent({
  componentAction,
  isLoading,
}: NewTransactionComponentProps) {
  return (
    <Button
      size="sm"
      onClick={componentAction}
      disabled={isLoading}
      className="w-40 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="mr-2 size-4 shrink-0 animate-spin" />
      ) : (
        <Plus className="mr-2 size-4 shrink-0" />
      )}
      {isLoading ? (
        <Skeleton className="h-4 w-full bg-muted opacity-45" />
      ) : (
        'Novo lançamento'
      )}
    </Button>
  )
}

const NewTransaction = premiumComponents(NewTransactionComponent)

function NewTransactionWrapper() {
  const { handleToggleNewTransactionSheet } = useNewTransaction()
  return <NewTransaction componentAction={handleToggleNewTransactionSheet} />
}
export { NewTransactionWrapper }
