'use client'
import { type PlanNamesType } from '@saas/core'
import type { VariantProps } from 'class-variance-authority'
import { useState, useTransition } from 'react'

import { updateSubscritionBillingPortalSessionAction } from '@/actions/subscription'

import { Badge } from '../ui/badge'
import { Button, type buttonVariants } from '../ui/button'
import { Icons } from '../ui/icons'

interface PlanCardProps extends VariantProps<typeof buttonVariants> {
  plan: PlanNamesType
  name: string
  type: 'mensal' | 'anual'
  mostPopular?: boolean
  price: string
  discountText?: string
  info: string
  buyText: string
}
export function PlanCard({
  plan,
  name,
  type,
  mostPopular = false,
  price,
  discountText,
  info,
  buyText,
  variant,
}: PlanCardProps) {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<{
    success: boolean
    message: string | null
    errors: Record<string, string[]> | null
  }>({
    success: false,
    message: null,
    errors: null,
  })
  function handleUpgrade() {
    startTransition(async () => {
      const result = await updateSubscritionBillingPortalSessionAction(plan)

      if (result) {
        setState(result)
      }
    })
  }
  return (
    <div className="space-y-4 rounded-md border p-3 shadow-md lg:min-w-72">
      <div className="flex items-center justify-between">
        <div className="flex items-end gap-1">
          <p className="text-2xl font-medium">{name}</p>
          <p className="mb-[3px] text-sm capitalize text-muted-foreground">
            {type}
          </p>
        </div>
        {mostPopular && <Badge variant="outline">Mais escolhido</Badge>}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-end">
          <span className="text-4xl font-medium">R$ {price}</span>
          <span className="mb-1 text-sm font-medium text-muted-foreground">
            {type === 'mensal' && '/mês'}
            {type === 'anual' && '/ano'}
          </span>
        </div>
        {discountText && <Badge>{discountText}</Badge>}
      </div>
      <p className="max-w-sm text-muted-foreground">{info}</p>
      <div>
        {/* <Button className="w-full">Quero esse!</Button> */}
        <Button
          onClick={handleUpgrade}
          disabled={isPending}
          className="w-full"
          variant={variant}
        >
          {isPending && <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />}
          {buyText}
        </Button>
      </div>
    </div>
  )
}
