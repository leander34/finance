import { api } from '@/http/api-client'

export interface UpdateFinancialAccountRequest {
  slug: string
  financialAccountId: string
  name: string
  visibledInOverallBalance: boolean
  accountType: 'CC' | 'CP' | 'CI' | 'DINHEIRO' | 'OUTROS'
  financialInstitutionId: string
  color: string
}

export async function updateFinancialAccountHttp({
  slug,
  financialAccountId,
  ...data
}: UpdateFinancialAccountRequest) {
  const result = await api.put(
    `organizations/${slug}/financial-accounts/${financialAccountId}`,
    {
      json: data,
    },
  )
  return result
}
