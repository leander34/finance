export enum PLAN_NAMES {
  'FREE' = 'FREE',
  'MONTHLY_PREMIUM' = 'MONTHLY_PREMIUM',
  'FREE_PREMIUM' = 'FREE_PREMIUM',
  'YEARLY_PREMIUM' = 'YEARLY_PREMIUM',
}

export type PlanNamesType = keyof typeof PLAN_NAMES
export enum RESOLVED_PLAN_NAMES {
  'FREE' = 'FREE',
  'PREMIUM' = 'PREMIUM',
}
export type ResolvedPlanNamesType = keyof typeof RESOLVED_PLAN_NAMES
export enum SUBSCRIPTION_TYPE {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

type Plan = {
  stripePriceId: string
  name: PLAN_NAMES
  resolvendPlan: RESOLVED_PLAN_NAMES
  subscriptionType: SUBSCRIPTION_TYPE
  features: {
    transactionLimitPerDay: number
    transferLimitPerDay: number
    limiteCreditCards: number
    limiteFinancialAccounts: number
    enabledOpenFinance: boolean
    canDoFinancialPlanning: boolean
    canCreateFinancialGoals: boolean
    canUpdateDefaultCategories: boolean
    canUpsertNewCategories: boolean
    canUpsertTags: boolean
    enabledNetworkFriends: boolean
  }
}

const premiumFeatures = {
  transactionLimitPerDay: 1000000,
  transferLimitPerDay: 1000000,
  adjustmentTransactionLimitPerDay: 1000000,
  limiteCreditCards: 1000000,
  limiteFinancialAccounts: 1000000,
  enabledOpenFinance: true,
  canDoFinancialPlanning: true,
  canCreateFinancialGoals: true,
  canUpdateDefaultCategories: true,
  canUpsertNewCategories: true,
  canUpsertTags: true,
  enabledNetworkFriends: true,
}
const freeFeatures = {
  transactionLimitPerDay: 10,
  transferLimitPerDay: 1,
  adjustmentTransactionLimitPerDay: 10,
  limiteCreditCards: 1,
  limiteFinancialAccounts: 1,
  enabledOpenFinance: false,
  canDoFinancialPlanning: false,
  canCreateFinancialGoals: false,
  canUpdateDefaultCategories: true,
  canUpsertNewCategories: false,
  canUpsertTags: false,
  enabledNetworkFriends: false,
}
export const stripePlans = {
  FREE: {
    stripePriceId: 'price_1PimWMHzK2maGqymoj9tvA0q',
    name: PLAN_NAMES.FREE,
    resolvendPlan: RESOLVED_PLAN_NAMES.FREE,
    subscriptionType: SUBSCRIPTION_TYPE.MONTHLY,
    price: '0,00',
    features: freeFeatures,
  },
  MONTHLY_PREMIUM: {
    stripePriceId: 'price_1PimYZHzK2maGqymBq0HbAe2',
    name: PLAN_NAMES.MONTHLY_PREMIUM,
    resolvendPlan: RESOLVED_PLAN_NAMES.PREMIUM,
    subscriptionType: SUBSCRIPTION_TYPE.MONTHLY,
    price: '11,90',
    features: premiumFeatures,
  },
  FREE_PREMIUM: {
    stripePriceId: 'price_1PkG0IHzK2maGqym3rdbx7Lu',
    name: PLAN_NAMES.FREE_PREMIUM,
    resolvendPlan: RESOLVED_PLAN_NAMES.PREMIUM,
    subscriptionType: SUBSCRIPTION_TYPE.MONTHLY,
    price: '0,00',
    features: premiumFeatures,
  },
  YEARLY_PREMIUM: {
    stripePriceId: 'price_1Pimj3HzK2maGqymUDATklLG',
    name: PLAN_NAMES.YEARLY_PREMIUM,
    resolvendPlan: RESOLVED_PLAN_NAMES.PREMIUM,
    subscriptionType: SUBSCRIPTION_TYPE.YEARLY,
    price: '109,90',
    features: premiumFeatures,
  },
} as const

export const getPlanByStripeId = (stripePriceId: string) => {
  let plan: Plan | null = null
  for (const p in stripePlans) {
    if (
      stripePlans[p as keyof typeof stripePlans].stripePriceId === stripePriceId
    ) {
      plan = stripePlans[p as keyof typeof stripePlans]
    }
  }
  return plan
}

export const getPlanByName = (planName: string) => {
  let plan: Plan | null = null
  for (const p in stripePlans) {
    if (stripePlans[p as keyof typeof stripePlans].name === planName) {
      plan = stripePlans[p as keyof typeof stripePlans]
    }
  }
  return plan
}

export const getResolvedPlanByName = (
  revolvedPlanName: RESOLVED_PLAN_NAMES,
) => {
  let plan: Plan | null = null
  for (const p in stripePlans) {
    if (
      stripePlans[p as keyof typeof stripePlans].resolvendPlan ===
      revolvedPlanName
    ) {
      plan = stripePlans[p as keyof typeof stripePlans]
    }
  }
  return plan ?? stripePlans.FREE
}

export function getCurrentActivePlan(
  subscription: {
    resolvedPlan: RESOLVED_PLAN_NAMES | undefined
    status: string | undefined
  } | null,
) {
  const currentPlanResolved = subscription?.resolvedPlan
    ? subscription?.resolvedPlan
    : RESOLVED_PLAN_NAMES.FREE

  const isPremium = currentPlanResolved === RESOLVED_PLAN_NAMES.PREMIUM
  const isActiveOrInTrialing =
    subscription?.status === 'active' || subscription?.status === 'trialing'

  const resolvedActivePlan =
    isPremium && isActiveOrInTrialing
      ? RESOLVED_PLAN_NAMES.PREMIUM
      : RESOLVED_PLAN_NAMES.FREE

  const currentActivePlan = getResolvedPlanByName(resolvedActivePlan)

  return currentActivePlan
}
