import { api } from '@/http/api-client'

export interface ArchiveCreditCardHttpRequest {
  slug: string
  creditCardId: string
}

export async function archiveCreditCardHttp({
  slug,
  creditCardId,
}: ArchiveCreditCardHttpRequest) {
  await api.patch(`organizations/${slug}/credit-cards/${creditCardId}/archive`)
}
