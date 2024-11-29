/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useTransition } from 'react'

import {
  manageSubscriptionBillingPortalSessionAction,
  updateSubscritionBillingPortalSessionAction,
} from '@/actions/subscription'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

export function BillingForm() {
  return (
    <div className="space-y-4">
      {/* {JSON.stringify(state, null, 2)} */}
      <ButtonUpgrade />
      <ButtonManage />
      <ButtonCancel />
    </div>
  )
}

function ButtonUpgrade() {
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
      const result =
        await updateSubscritionBillingPortalSessionAction('MONTHLY_PREMIUM')
      if (result) {
        setState(result)
      }
    })
  }
  return (
    <div className="rounded-md border p-2">
      <h1>Upgrade card</h1>
      {JSON.stringify(state, null, 2)}
      <Button onClick={handleUpgrade} disabled={isPending}>
        {isPending && <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />}
        Upgrade
      </Button>
    </div>
  )
}

function ButtonManage() {
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
  function handleManage() {
    startTransition(async () => {
      const result = await manageSubscriptionBillingPortalSessionAction()

      if (result) {
        setState(result)
      }
    })
  }
  return (
    <div className="rounded-md border p-2">
      <h1>Manage card</h1>
      {JSON.stringify(state, null, 2)}
      <Button onClick={handleManage} disabled={isPending}>
        {isPending && <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />}
        Manage
      </Button>
    </div>
  )
}

function ButtonCancel() {
  const [isPending, startTransition] = useTransition()
  const [state] = useState<{
    success: boolean
    message: string | null
    errors: Record<string, string[]> | null
  }>({
    success: false,
    message: null,
    errors: null,
  })
  function handleCancel() {
    startTransition(async () => {
      // const result =
      //   await createUpdateSubscritionBillingPortalSessionAction(
      //     'MONTHLY_PREMIUM',
      //   )
      // if (result) {
      //   setState(result)
      // }
    })
  }
  return (
    <div className="rounded-md border p-2">
      <h1>Cancel card</h1>
      {JSON.stringify(state, null, 2)}
      <Button onClick={handleCancel} disabled={isPending}>
        {isPending && <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />}
        Cancel
      </Button>
    </div>
  )
}
