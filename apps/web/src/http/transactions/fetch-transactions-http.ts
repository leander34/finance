import { api } from '@/http/api-client'

interface FetchTransactionsHttpRequest {
  slug: string
  page: number
  startDate?: string
  endDate?: string
  visibledInOverallBalance: boolean | null
  type?:
    | (
        | 'REVENUE'
        | 'EXPENSE'
        | 'TRANSFER'
        | 'POSITIVE_ADJUSTMENT'
        | 'NEGATIVE_ADJUSTMENT'
      )[]
    | null
}

export interface FetchTransactionsHttpResponse {
  amountOfPages: number
  amountOfTransactions: number
  transactions: {
    id: string
    organizationId: string
    description: string
    status: 'PAID' | 'UNPAID'
    type:
      | 'REVENUE'
      | 'EXPENSE'
      | 'TRANSFER'
      | 'POSITIVE_ADJUSTMENT'
      | 'NEGATIVE_ADJUSTMENT'
    realizationDate: string
    amount: number
    degreeOfNeed: number | null
    observation: string | null
    paidAt: string | null
    transactionPaymentType: string
    expectedPaymentDate: string
    calculatedTransactionStatus: 'PAID' | 'PAST_DUE_DATE' | 'OPEN'
    creditCardId: string | null
    financialAccountId: string | null
    recurrenceId: string | null
    installmentNumber: number | null
    creditCardInvoice: {
      id: string
      creditCardId: string
      periodStart: string
      periodEnd: string
      dueDate: string
      month: number
      year: number
      createdAt: string
      updatedAt: string
      deletedAt: string | null
    } | null

    financialAccount: {
      id: string
      name: string
      imageUrl: string
    } | null
    creditCard: {
      id: string
      name: string
      imageUrl: string
    } | null
    tags: {
      id: string
      name: string
    }[]
    category: {
      id: string
      name: string
      icon: string
      color: string
      description: string | null
    } | null
  }[]
}

// usar cache
export async function fetchTransactionsHttp({
  page,
  slug,
  endDate,
  startDate,
  type,
  visibledInOverallBalance,
}: FetchTransactionsHttpRequest) {
  const result = await api
    .post(`organizations/${slug}/transactions/list`, {
      json: {
        page,
        startDate,
        endDate,
        type,
        visibledInOverallBalance,
      },
    })
    .json<FetchTransactionsHttpResponse>()
  return result
}
