import { api } from '@/http/api-client'

export interface CreateTransferRequest {
  slug: string
  sourceAccount: string
  destinationAccount: string
  description: string
  observation: string | undefined | null
  amount: number
  realizationDate: string
  launchType: 'SINGLE_LAUNCH' | 'RECURRENT_LAUNCH'
  recurrencePeriod:
    | 'diario'
    | 'semanal'
    | 'quinzenal'
    | 'mensal'
    | 'bimestral'
    | 'trimestral'
    | 'semestral'
    | 'anual'
    | null
  tags: string[]
}

export async function createTransferHttp({
  slug,
  ...data
}: CreateTransferRequest) {
  const result = await api.post(`organizations/${slug}/transfers`, {
    json: data,
  })
  return result
}
