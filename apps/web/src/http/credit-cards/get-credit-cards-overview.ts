import { api } from '@/http/api-client'

export interface GetCreditCardsOverviewHttpRequest {
  slug: string
  month: number
  year: number
}

export interface GetCreditCardsOverviewHttpResponse {
  totalCreditCardsAvailableLimit: number
  nextInvoiceDueDate: string
  summaryOfInvoicesForTheSelectedMonth: {
    totalInvoiceAmount: number
    invoicePaymentAmount: number
  }
}

export async function getCreditCardsOverviewHttp({
  slug,
  ...data
}: GetCreditCardsOverviewHttpRequest) {
  const result = await api
    .post(`organizations/${slug}/credit-cards/overview`, {
      json: data,
    })
    .json<GetCreditCardsOverviewHttpResponse>()
  return result
}
