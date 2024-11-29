import { api } from '@/http/api-client'

export interface PayCreditCardInvoiceHttpRequest {
  slug: string
  invoiceId: string
  amount: number
  financialAccountId: string
  realizationDate: string
}

export async function payCreditCardInvoiceHttp({
  slug,
  invoiceId,
  ...data
}: PayCreditCardInvoiceHttpRequest) {
  const result = await api.post(
    `organizations/${slug}/credit-cards/invoice/${invoiceId}/payments`,
    {
      json: data,
    },
  )
  return result
}
