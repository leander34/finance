import { api } from '@/http/api-client'

interface GetMonthlyRevenueExpenseChartHttpRequest {
  slug: string
  year: number
  visibledInOverallBalance: boolean | null
  status: ('PAID' | 'UNPAID')[]
}

export interface GetMonthlyRevenueExpenseChartHttpResponse {
  transactionsByMonth: {
    month: number
    amountOfExpenses: number
    amountOfRevenues: number
    totalAmountOfExpense: number
    totalAmountOfRevenue: number
    balance: number
  }[]
}

// usar cache
export async function getMonthlyRevenueExpenseChartHttp({
  slug,
  year,
  status,
  visibledInOverallBalance,
}: GetMonthlyRevenueExpenseChartHttpRequest) {
  const result = await api
    .post(`organizations/${slug}/transactions/charts/monthly-revenue-expense`, {
      json: {
        year,
        status,
        visibledInOverallBalance,
      },
    })
    .json<GetMonthlyRevenueExpenseChartHttpResponse>()
  return result
}
