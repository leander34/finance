import { api } from '@/http/api-client'

export interface DeletePaymentsFromACreditCardInvoiceHttpRequest {
  slug: string
  invoiceId: string
}

export async function deletePaymentsFromACreditCardInvoiceHttp({
  slug,
  invoiceId,
}: DeletePaymentsFromACreditCardInvoiceHttpRequest) {
  await api.delete(
    `organizations/${slug}/credit-cards/invoice/${invoiceId}/payments`,
  )
}
