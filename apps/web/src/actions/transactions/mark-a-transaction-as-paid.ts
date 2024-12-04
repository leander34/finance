'use server'
import { HTTPError } from 'ky'

import {
  getCurrentOrganizationSlug,
  getUserProfileServer,
} from '@/auth/session-server-only'
import { markATransactionAsPaidHttp } from '@/http/transactions/mark-a-transaction-as-paid-http'

export async function markATransactionAsPaidAction(transactionId: string) {
  await getUserProfileServer()
  const currentOrg = getCurrentOrganizationSlug()
  try {
    await markATransactionAsPaidHttp({
      slug: currentOrg!,
      transactionId,
      amount: 100,
      realizationDate: '',
    })
    // await fakeDelay(3000)
    return {
      success: true,
      message: 'Despesa marcada como paga.',
      errors: null,
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json()
      return { success: false, message, errors: null }
    }
    console.log(error)

    return {
      success: false,
      message: 'Erro inesperado, tente novamente em alguns minutos.',
      errors: null,
    }
  }
}
