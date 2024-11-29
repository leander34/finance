import { api } from '@/http/api-client'

interface GetCashFlowChartHttpRequest {
  slug: string
  visibledInOverallBalance: boolean | null
  // year: number
  // status: ('PAID' | 'UNPAID')[]
}

export interface GetCashFlowChartHttpResponse {
  cashFlowData: {
    date: string
    amount: number
    amountOfTransactions: number
  }[]
}

// usar cache
export async function getCashFlowChartHttp({
  slug,
  visibledInOverallBalance,
}: GetCashFlowChartHttpRequest) {
  const result = await api
    .post(`organizations/${slug}/balance/cash-flow`, {
      json: {
        visibledInOverallBalance,
      },
    })
    .json<GetCashFlowChartHttpResponse>()
  return result
}
