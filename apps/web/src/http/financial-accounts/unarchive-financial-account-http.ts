import { api } from '@/http/api-client'

export interface UnarchiveFinancialAccountHttpRequest {
  slug: string
  financialAccountId: string
}

export async function unarchiveFinancialAccountHttp({
  slug,
  financialAccountId,
}: UnarchiveFinancialAccountHttpRequest) {
  const result = await api.patch(
    `organizations/${slug}/financial-accounts/${financialAccountId}/unarchive`,
  )
  return result
}
