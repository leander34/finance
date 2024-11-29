import { api } from '@/http/api-client'

interface ManageSubscriptionOnBillingPortalRequest {
  returnUrl: string
}
interface ManageSubscriptionOnBillingPortalResponse {
  url: string
}

export async function manageSubscriptionOnBillingPortalHttp({
  returnUrl,
}: ManageSubscriptionOnBillingPortalRequest): Promise<ManageSubscriptionOnBillingPortalResponse> {
  const result = await api
    .post('users/billing-portal/manage-subscrition', {
      json: {
        returnUrl,
      },
    })
    .json<ManageSubscriptionOnBillingPortalResponse>()
  return result
}
