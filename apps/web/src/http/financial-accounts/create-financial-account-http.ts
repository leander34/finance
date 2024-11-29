import { api } from '@/http/api-client'

export interface CreateFinancialAccountRequest {
  slug: string
  name: string
  initialBalance: number
  visibledInOverallBalance: boolean
  accountType: 'CC' | 'CP' | 'CI' | 'DINHEIRO' | 'OUTROS'
  financialInstitutionId: string
  accountIntegrationType: 'OPEN_FINANCE' | 'MANUAL'
  color: string
}

export async function createFinancialAccountHttp({
  slug,
  ...data
}: CreateFinancialAccountRequest) {
  const result = await api.post(`organizations/${slug}/financial-accounts`, {
    json: data,
  })
  return result
}
