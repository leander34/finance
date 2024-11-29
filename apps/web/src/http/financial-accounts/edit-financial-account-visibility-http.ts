import { api } from '@/http/api-client'

export interface EditFinancialAccountVisibilityRequest {
  slug: string
  financialAccountId: string
  visibledInOverallBalance: boolean
}

export async function editFinancialAccountVisibilityHttp({
  slug,
  financialAccountId,
  ...data
}: EditFinancialAccountVisibilityRequest) {
  const result = await api.put(
    `organizations/${slug}/financial-accounts/${financialAccountId}/visibility`,
    {
      json: data,
    },
  )
  return result
}
