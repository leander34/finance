import { api } from '@/http/api-client'

export interface CreateTransactionRequest {
  slug: string
  description: string
  observation: string | undefined | null
  amount: number
  type:
    | 'REVENUE'
    | 'EXPENSE'
    | 'TRANSFER'
    | 'POSITIVE_ADJUSTMENT'
    | 'NEGATIVE_ADJUSTMENT'
  realizationDate: string
  degreeOfNeed: number | null
  alreadyPaid: boolean
  skip: boolean
  launchType: 'SINGLE_LAUNCH' | 'INSTALLMENT_LAUNCH' | 'RECURRENT_LAUNCH'
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
  installmentsPeriod:
    | 'dias'
    | 'semanas'
    | 'quinzenas'
    | 'meses'
    | 'bimestres'
    | 'trimestres'
    | 'semestres'
    | 'anos'
    | null
  amountOfInstallments: number | null
  category: string | null
  tags: string[]
  financialAccountId?: string | undefined
  creditCardId?: string | undefined
}

export async function createTransactionHttp({
  slug,
  ...data
}: CreateTransactionRequest) {
  console.log('data')
  console.log(data)
  const result = await api.post(`organizations/${slug}/transactions`, {
    json: data,
  })
  return result
}
