import { api } from '@/http/api-client'

import type { CreateCreditCardHttpRequest } from './create-credit-card-http'

export interface FetchCreditCardsWithDetailsHttpRequest {
  slug: string
  month: number
  year: number
}

export interface FetchCreditCardsWithDetailsHttpResponse {
  amountOfCreditCards: number
  amountOfPages: number
  creditCards: {
    id: string
    name: string
    flag: CreateCreditCardHttpRequest['flag']
    limit: number
    availableLimit: number
    usedLimit: number
    usedLimitInPercentage: number
    invoiceClosingDate: number
    invoiceDueDate: number
    color: string
    archivedAt: string
    blockedByExpiredSubscription: boolean
    description: string | null
    createdAt: string
    financialAccount: {
      id: string
      name: string
      bank: {
        id: string
        name: string
        imageUrl: string
      }
    }
    invoice: {
      status: 'OPEN' | 'CLOSED' | 'PAST_DUE_DATE' | 'NOT_OPEN'
      invoicePaymentStatus: 'FULLY_PAID' | 'PARTIALLY_PAID' | 'UNPAID' | null
      totalInvoiceExpensesValue: number
      totalInvoicePaymentsValue: number
      currentInvoiceValue: number
      id: string
      creditCardId: string
      periodStart: string
      periodEnd: string
      dueDate: string
      createdAt: string
      updatedAt: string
      deletedAt: string
      amountOfTransactions: number
      amountOfPayments: number
      lastInvoicePaymentDate: string | null
      lastInvoicePaymentAmount: number | null
    } | null
  }[]
}

export async function fetchCreditCardsWithDetailsHttp({
  slug,
  ...data
}: FetchCreditCardsWithDetailsHttpRequest) {
  const result = await api
    .post(`organizations/${slug}/credit-cards/details`, {
      json: data,
    })
    .json<FetchCreditCardsWithDetailsHttpResponse>()
  return result
}
