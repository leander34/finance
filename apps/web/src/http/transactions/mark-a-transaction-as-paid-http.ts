import { api } from '../api-client'
interface PayTransactionHttpRequest {
  slug: string
  transactionId: string
  amount: number
  realizationDate: string
}
export async function markATransactionAsPaidHttp({
  slug,
  transactionId,
  amount,
  realizationDate,
}: PayTransactionHttpRequest) {
  await api.patch(
    `organizations/${slug}/transactions/${transactionId}/mark-as-paid`,
    {
      json: {
        amount,
        realizationDate,
      },
    },
  )
}
