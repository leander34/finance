import { api } from '@/http/api-client'

interface UpdateSubscriptionOnBillingPortalRequest {
  updateToPlan: string
  returnUrl: string
  returnSuccessUpdateUrl: string
}

interface UpdateSubscriptionOnBillingPortalResponse {
  url: string
}

// usar cache
export async function updateSubscriptionOnBillingPortalHttp({
  updateToPlan,
  returnUrl,
  returnSuccessUpdateUrl,
}: UpdateSubscriptionOnBillingPortalRequest): Promise<UpdateSubscriptionOnBillingPortalResponse> {
  const result = await api
    .post('users/billing-portal/update-subscrition', {
      json: {
        updateToPlan,
        returnUrl,
        returnSuccessUpdateUrl,
      },
    })
    .json<UpdateSubscriptionOnBillingPortalResponse>()
  return result
}
