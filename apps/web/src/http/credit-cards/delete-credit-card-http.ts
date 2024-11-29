import { api } from '@/http/api-client'

export interface DeleteCreditCardHttpRequest {
  slug: string
  creditCardId: string
}

export async function deleteCreditCardHttp({
  slug,
  creditCardId,
}: DeleteCreditCardHttpRequest) {
  await api.delete(`organizations/${slug}/credit-cards/${creditCardId}`)
}
