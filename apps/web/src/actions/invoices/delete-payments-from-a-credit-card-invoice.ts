'use server'

import { HTTPError } from 'ky'

import {
  getCurrentOrganizationSlug,
  getUserProfileServer,
} from '@/auth/session-server-only'
import { deletePaymentsFromACreditCardInvoiceHttp } from '@/http/credit-cards/delete-payments-from-a-credit-card-invoice-http'

export async function deletePaymentsFromACreditCardInvoiceAction(
  invoiceId: string,
) {
  await getUserProfileServer()
  const currentOrg = getCurrentOrganizationSlug()
  try {
    await deletePaymentsFromACreditCardInvoiceHttp({
      slug: currentOrg!,
      invoiceId,
    })
    return {
      success: true,
      message: 'Pagamento deletados com sucesso.',
      errors: null,
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json()
      return { success: false, message, errors: null }
    }

    return {
      success: false,
      message: 'Erro inesperado, tente novamente em alguns minutos.',
      errors: null,
    }
  }
}
