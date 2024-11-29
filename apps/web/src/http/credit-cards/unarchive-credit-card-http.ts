import { api } from '@/http/api-client'

export interface UnarchiveCreditCardHttpRequest {
  slug: string
  creditCardId: string
}

export async function unarchiveCreditCardHttp({
  slug,
  creditCardId,
}: UnarchiveCreditCardHttpRequest) {
  await api.patch(
    `organizations/${slug}/credit-cards/${creditCardId}/unarchive`,
  )
}
