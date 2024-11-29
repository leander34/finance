import type {
  PlanNamesType,
  ResolvedPlanNamesType,
} from '@saas/core/src/stripe/definitions'

import { api } from '@/http/api-client'

export interface GetUserProfileResponse {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
    phone: string | null
    document: string | null
    createdAt: string
    stripeCustomerId: string
    firstLogin: boolean
    firstLoginToday: boolean
    subscription: {
      currentPlan: PlanNamesType
      resolvedPlan: ResolvedPlanNamesType
      resolvedActivePlan: ResolvedPlanNamesType
      // stripeSubscriptionId: string | null
      // stripePriceId: string | null
      status: string | null
      currentPeriodStart: number | null
      currentPeriodEnd: number | null
    }
  }
}

// usar cache
export async function getUserProfileHttp(): Promise<GetUserProfileResponse> {
  const result = await api.get('profile').json<GetUserProfileResponse>()
  return result
}
