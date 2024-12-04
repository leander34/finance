'use client'
import { PLAN_NAMES, type PlanNamesType, stripePlans } from '@saas/core'
import Link from 'next/link'
import { type FormEvent, useState, useTransition } from 'react'

import { updateSubscritionBillingPortalSessionAction } from '@/actions/subscription'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
interface PlansFormProps {
  currentOrg: string | null
}
export function PlansForm({ currentOrg }: PlansFormProps) {
  const [isPending, startTransition] = useTransition()
  const [, setState] = useState<{
    success: boolean
    message: string | null
    errors: Record<string, string[]> | null
  }>({
    success: false,
    message: null,
    errors: null,
  })
  const [selectedPlan, setSelectedPlan] =
    useState<PlanNamesType>('MONTHLY_PREMIUM')
  function handleChoisePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      const result =
        await updateSubscritionBillingPortalSessionAction(selectedPlan)
      if (result) {
        setState(result)
      }
    })
  }
  return (
    <form onSubmit={handleChoisePlan} className="flex flex-col justify-between">
      {/* {JSON.stringify(state, null, 2)} */}
      <RadioGroup
        defaultValue={selectedPlan}
        onValueChange={(value: PlanNamesType) => setSelectedPlan(value)}
        disabled={isPending}
      >
        <div className="space-y-4">
          <Label
            htmlFor="r1"
            className={cn(
              'flex cursor-pointer gap-4 rounded-md border-2 p-4',
              selectedPlan === 'MONTHLY_PREMIUM' &&
                'border-primary bg-primary text-primary-foreground shadow-md',
            )}
          >
            <RadioGroupItem
              value={PLAN_NAMES.MONTHLY_PREMIUM}
              id="r1"
              className="bg-secondary"
            />
            <div className="flex flex-col space-y-1">
              <span className="text-lg font-medium leading-none">
                Premium mensal
              </span>
              <span
                className={cn(
                  'max-w-xs text-sm leading-none text-muted-foreground',
                  selectedPlan === 'MONTHLY_PREMIUM' && 'text-secondary',
                )}
              >
                Lorem ipsum dolor sit amet consectetur Excepturi.
              </span>
            </div>
            <span className="text-lg font-medium">
              R$ {stripePlans.MONTHLY_PREMIUM.price} /mês
            </span>
          </Label>
          <Label
            htmlFor="r2"
            className={cn(
              'flex cursor-pointer gap-4 rounded-md border-2 p-4',
              selectedPlan === 'YEARLY_PREMIUM' &&
                'border-primary bg-primary text-primary-foreground shadow-md',
            )}
          >
            <RadioGroupItem
              value={PLAN_NAMES.YEARLY_PREMIUM}
              id="r2"
              className="bg-secondary"
            />
            <div className="flex flex-col space-y-1">
              <span className="text-lg font-medium leading-none">
                Premium anual
              </span>
              <span
                className={cn(
                  'max-w-xs text-sm leading-none text-muted-foreground',
                  selectedPlan === 'YEARLY_PREMIUM' && 'text-secondary',
                )}
              >
                Lorem ipsum dolor sit amet consectetur Excepturi.
              </span>
            </div>
            <span className="text-lg font-medium">
              R$ {stripePlans.YEARLY_PREMIUM.price} /ano
            </span>
          </Label>
        </div>
      </RadioGroup>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          asChild
          className={cn(isPending && 'pointer-events-none cursor-not-allowed')}
        >
          <Link href={`/o/${currentOrg}/dashboard`}>
            Continuar no plano Free
          </Link>
        </Button>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />}
          Continar
        </Button>
      </div>
    </form>
  )
}
