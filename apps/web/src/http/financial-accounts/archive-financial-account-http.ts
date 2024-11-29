import { api } from '@/http/api-client'

export interface ArchiveFinancialAccountHttpRequest {
  slug: string
  financialAccountId: string
}

export async function archiveFinancialAccountHttp({
  slug,
  financialAccountId,
}: ArchiveFinancialAccountHttpRequest) {
  const result = await api.patch(
    `organizations/${slug}/financial-accounts/${financialAccountId}/archive`,
  )
  return result
}
