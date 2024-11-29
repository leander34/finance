import { api } from '../api-client'
interface PayTransactionHttpRequest {
  slug: string
  transactionId: string
}
export async function markATransactionAsUnpaidHttp({
  slug,
  transactionId,
}: PayTransactionHttpRequest) {
  await api.patch(
    `organizations/${slug}/transactions/${transactionId}/mark-as-unpaid`,
  )
}
