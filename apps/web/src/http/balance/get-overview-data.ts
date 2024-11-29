import { api } from '@/http/api-client'

export interface GetOverviewDataRequest {
  slug: string
  month: number
  year: number
  visibledInOverallBalance: boolean | null
}

export interface GetOverviewDataResponse {
  realMonthlyBalance: number
  expectedMonthlyBalance: number
  expectedRevenueOfTheMonth: number
  realRevenueOfTheMonth: number
  percentageOfRevenueComparedToLastMonth: number | null
  expectedExpenseOfTheMonth: number
  paidExpenseOfTheMonth: number
  unpaidExpenseOfTheMonth: number
  percentageOfExpenseComparedToLastMonth: number | null
  currentBankingBalance: number
  expectedBankingBalanceForToday: number
  creditCardsTransactionsOnSelectedMonth: number
  selectedInvoiceAmount: number
  selectedInvoiceAmountPaid: number
}

export async function getOverviewDataHttp({
  slug,
  month,
  year,
  visibledInOverallBalance,
}: GetOverviewDataRequest) {
  const result = await api
    .post(`organizations/${slug}/balance/overview`, {
      json: {
        month,
        year,
        visibledInOverallBalance,
      },
    })
    .json<GetOverviewDataResponse>()
  return result
}
