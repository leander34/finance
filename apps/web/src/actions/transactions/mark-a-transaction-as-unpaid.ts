'use server'
import { HTTPError } from 'ky'

import {
  getCurrentOrganizationSlug,
  getUserProfileServer,
} from '@/auth/session-server-only'
import { markATransactionAsUnpaidHttp } from '@/http/transactions/mark-a-transaction-as-unpaid-http'

export async function markATransactionAsUnpaidAction(transactionId: string) {
  await getUserProfileServer()
  const currentOrg = getCurrentOrganizationSlug()
  try {
    await markATransactionAsUnpaidHttp({
      slug: currentOrg!,
      transactionId,
    })
    // await fakeDelay(3000)
    return {
      success: true,
      message: 'Despesa desmarcada como paga.',
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
