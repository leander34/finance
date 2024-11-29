import { api } from '@/http/api-client'

export interface AdjustFinancialAccountBalanceHttpRequest {
  slug: string
  adjustTo: number
  type: 'ADJUSTMENT_TRANSACTION' | 'CHANGE_INITIAL_BALANCE'
  description: string | null
  financialAccountId: string
}

export async function adjustFinancialAccountBalanceHttp({
  slug,
  financialAccountId,
  ...data
}: AdjustFinancialAccountBalanceHttpRequest) {
  const result = await api.post(
    `organizations/${slug}/financial-accounts/${financialAccountId}/adjust-balance`,
    {
      json: data,
    },
  )
  return result
}
