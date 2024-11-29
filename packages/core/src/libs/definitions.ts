export enum PLAN_NAMES {
  'FREE' = 'FREE',
  'MONTHLY_PREMIUM' = 'MONTHLY_PREMIUM',
  'YEARLY_PREMIUM' = 'YEARLY_PREMIUM',
}
enum SubscriptionType {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}
type Plan = {
  stripePriceId: string
  name: PLAN_NAMES
  subscriptionType: SubscriptionType
}

export const stripePlans: Record<string, Plan> = {
  FREE: {
    stripePriceId: 'price_1PimWMHzK2maGqymoj9tvA0q',
    name: PLAN_NAMES.FREE,
    subscriptionType: SubscriptionType.MONTHLY,
  },
  MONTHLY_PREMIUM: {
    stripePriceId: 'price_1PimYZHzK2maGqymBq0HbAe2',
    name: PLAN_NAMES.MONTHLY_PREMIUM,
    subscriptionType: SubscriptionType.MONTHLY,
  },
  YEARLY_PREMIUM: {
    stripePriceId: 'price_1Pimj3HzK2maGqymUDATklLG',
    name: PLAN_NAMES.YEARLY_PREMIUM,
    subscriptionType: SubscriptionType.YEARLY,
  },
}

export const getPlan = (stripePriceId: string) => {
  let plan: Plan | null = null
  for (const p in stripePlans) {
    if (stripePlans[p].stripePriceId === stripePriceId) {
      plan = stripePlans[p]
    }
  }
  return plan
}
