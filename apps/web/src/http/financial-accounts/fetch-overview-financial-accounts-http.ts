import { api } from '@/http/api-client'

interface FetchOverviewFinancialAccountsHttpResponse {
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
    visibledInOverallBalance: boolean
  }[]
}

// usar cache
export async function fetchOverviewFinancialAccountsHttp(slug: string) {
  const result = await api
    .get(`organizations/${slug}/overview-accounts`)
    .json<FetchOverviewFinancialAccountsHttpResponse>()
  return result
}
