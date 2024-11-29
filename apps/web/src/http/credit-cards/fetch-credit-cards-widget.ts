import { api } from '@/http/api-client'

export interface FetchCreditCardsWidgetHttpRequest {
  slug: string
}

export interface FetchCreditCardsWidgetHttpResponse {
  amountOfCreditCards: number
  creditCards: {
    id: string
    organizationId: string
    name: string
    color: string
    imageUrl: string
    flag: string
    limit: number
    availableLimit: number
    usedLimit: number
    usedLimitInPercentage: number
    invoiceClosingDate: number
    invoiceDueDate: number
    currentInvoice: {
      id: string
      periodStart: string
      periodEnd: string
      dueDate: string
      currentInvoiceAmount: number
      month: number
      year: number
    } | null
  }[]
}

export async function fetchCreditCardsWidgetHttp(slug: string) {
  const result = await api
    .get(`organizations/${slug}/credit-cards/widget`)
    .json<FetchCreditCardsWidgetHttpResponse>()
  return result
}
