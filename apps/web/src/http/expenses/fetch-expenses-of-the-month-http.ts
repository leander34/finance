import { api } from '@/http/api-client'

interface FetchExpensesOfTheMonthHttpRequest {
  slug: string
  startDate?: string
  endDate?: string
}

interface FetchExpensesOfTheMonthHttpResponse {
  amountOfFinancialAccounts: number
  financialAccounts: {
    id: string
    organizationId: string
    name: string
    color: string
    imageUrl: string
    expectedExpensesValue: number
    expectedRevenuesValue: number
    expectedMonthlyBalance: number
    currentBalance: number
  }[]
}

// usar cache
export async function fetchOverviewFinancialAccountsHttp({
  slug,
  endDate,
  startDate,
}: FetchExpensesOfTheMonthHttpRequest) {
  const result = await api
    .post(`organizations/${slug}/transactions/list`, {
      json: {
        startDate,
        endDate,
      },
    })
    .json<FetchExpensesOfTheMonthHttpResponse>()
  return result
}
