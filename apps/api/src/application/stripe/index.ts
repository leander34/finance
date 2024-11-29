import {
  getPlanByName,
  getPlanByStripeId,
  PLAN_NAMES,
  RESOLVED_PLAN_NAMES,
  stripePlans,
  SUBSCRIPTION_TYPE,
} from '@saas/core'
import type Stripe from 'stripe'

import { prisma } from '@/infra/database/prisma'
import { stripe } from '@/lib/stripe'

import { SubscriptionEffectsService } from '../service/subscription-effects'

export const getStripeCustomerByEmail = async (email: string) => {
  const customers = await stripe.customers.list({ email })

  // console.log(customers)
  const customer = customers.data[0]
  return customer
}

export const getStripeCustomerByCustomerId = async (
  stripeCustomerId: string,
) => {
  const customer = await stripe.customers.retrieve(stripeCustomerId)
  return customer
}

async function createOrGetStripeCustomer(input: {
  name?: string
  email: string
}) {
  const customer = await getStripeCustomerByEmail(input.email)
  if (customer) return { customer }

  const createdStripeCustomer = await stripe.customers.create({
    email: input.email,
    name: input.name,
  })
  return {
    customer: createdStripeCustomer,
  }
}

const addFreeSubscription = async (stripeCustomerId: string) => {
  const stripePriceId = stripePlans.FREE.stripePriceId
  const createdStripeCustomerSubscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: stripePriceId }],
    // trial_period_days: 14,
  })

  return {
    stripeCustomerId,
    stripeSubscriptionId: createdStripeCustomerSubscription.id,
    stripeSubscriptionStatus: createdStripeCustomerSubscription.status,
    stripePriceId,
    stripeCurrentPeriodStart:
      createdStripeCustomerSubscription.current_period_start,
    stripeCurrentPeriodEnd:
      createdStripeCustomerSubscription.current_period_end,
    stripeDaysUntilDue: createdStripeCustomerSubscription.days_until_due,
    stripeEndedAt: createdStripeCustomerSubscription.ended_at,
    stripeStartDate: createdStripeCustomerSubscription.start_date,
    stripeProductId:
      createdStripeCustomerSubscription.items.data[0].price.product,
    stripeTrialStart: createdStripeCustomerSubscription.trial_start,
    stripeTrialEnd: createdStripeCustomerSubscription.trial_end,
    stripeCancelAt: createdStripeCustomerSubscription.cancel_at,
    stripeCanceledAt: createdStripeCustomerSubscription.canceled_at,
    stripeCancelAtPeriodEnd:
      createdStripeCustomerSubscription.cancel_at_period_end,
    stripeDiscountCouponId:
      createdStripeCustomerSubscription.discount?.coupon.id,
  }
}

// chamar essa função apenas no momento de cadastro do usuário, quando ele não tem um cadastro na plataforma nem na stripe.s
export const createOrGetCustumerAndAddFreeSubscription = async (input: {
  name?: string
  email: string
}) => {
  const { customer } = await createOrGetStripeCustomer(input)
  const response = await addFreeSubscription(customer.id)
  return response
}

// precisa estar com o plano free
export async function manageSubscriptionBillingPortalSession({
  stripeCustomerId,
  returnUrl,
}: {
  stripeCustomerId: string
  returnUrl: string
}) {
  const customer = await getStripeCustomerByCustomerId(stripeCustomerId)
  if (!customer) {
    throw new Error('')
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: returnUrl, // pensando para onde retornar
  })

  return {
    url: session.url,
  }
}

export const createUpdateSubscriptionBillingPortalSession = async ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userStripeSubscriptionId,
  updateToPlan,
  stripeCustomerId,
  returnUrl,
  returnSuccessUpdateUrl,
}: {
  organzationOwnerUserId?: string
  stripeCustomerId: string
  organzationOwnerUserEmail: string
  userStripeSubscriptionId: string
  updateToPlan: PLAN_NAMES
  returnUrl: string
  returnSuccessUpdateUrl: string
}) => {
  const newPlan = getPlanByName(updateToPlan)
  if (!newPlan) {
    throw new Error('')
  }

  const customer = await getStripeCustomerByCustomerId(stripeCustomerId)

  if (!customer) {
    throw new Error('')
  }

  // Pegar os items subscription atual
  const subscription = await stripe.subscriptionItems.list({
    subscription: userStripeSubscriptionId,
    limit: 1,
  })

  // const subscription2 = await stripe.subscriptions.list({
  //   customer: customer.id,
  //   limit: 1,
  // })

  // Abrir o portal de faturamento para atualizar o plano
  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: returnUrl, // pensando para onde retornar
    flow_data: {
      type: 'subscription_update_confirm',
      after_completion: {
        type: 'redirect',
        redirect: {
          return_url: returnSuccessUpdateUrl, // pensando para onde retornar
        },
      },
      subscription_update_confirm: {
        subscription: userStripeSubscriptionId,
        items: [
          {
            id: subscription.data[0].id,
            price: newPlan.stripePriceId,
            quantity: 1,
          },
        ],
      },
    },
  })

  return {
    url: session.url,
  }
}

// webhook
export const handleProcessWebhookUpdatedSubscription = async (event: {
  object: Stripe.Subscription
}) => {
  const stripeCustomerId = event.object.customer
  const stripeSubscriptionId = event.object.id
  const stripeSubscriptionStatus = event.object.status
  const stripePriceId = event.object.items.data[0].price.id
  const stripeProductId = event.object.items.data[0].price.product
  const stripeStartDate = event.object.start_date
  const stripeCurrentPeriodStart = event.object.current_period_start
  const stripeCurrentPeriodEnd = event.object.current_period_end
  const stripeEndedAt = event.object.ended_at
  const stripeDaysUntilDue = event.object.days_until_due
  const stripeTrialStart = event.object.trial_start
  const stripeTrialEnd = event.object.trial_end
  const stripeCancelAt = event.object.cancel_at
  const stripeCanceledAt = event.object.canceled_at
  const stripeCancelAtPeriodEnd = event.object.cancel_at_period_end
  const stripeDiscountCouponId = event.object.discount?.coupon.id
  console.log(stripeSubscriptionStatus)

  const userByStripeCustomerId = await prisma.user.findFirst({
    where: {
      stripeCustomerId: stripeCustomerId.toString(),
    },
    select: {
      id: true,
      memberOn: {
        select: {
          organizationId: true,
        },
        where: {
          role: 'ADMIN',
        },
      },
    },
  })

  if (!userByStripeCustomerId) {
    throw new Error('User not found.')
  }

  const plan = getPlanByStripeId(stripePriceId)
  const planName = plan?.name ?? PLAN_NAMES.FREE
  console.log(planName)
  const resolvedPlan = plan?.resolvendPlan ?? RESOLVED_PLAN_NAMES.FREE
  const subscriptionType = plan?.subscriptionType ?? SUBSCRIPTION_TYPE.MONTHLY

  await prisma.user.update({
    where: {
      id: userByStripeCustomerId.id,
    },
    data: {
      stripeCustomerId: stripeCustomerId.toString(),
      subscription: {
        update: {
          data: {
            status: stripeSubscriptionStatus,
            stripePriceId,
            stripeSubscriptionId,
            stripeProductId: stripeProductId.toString(),
            startDate: stripeStartDate,
            currentPeriodStart: stripeCurrentPeriodStart,
            currentPeriodEnd: stripeCurrentPeriodEnd,
            plan: planName,
            type: subscriptionType,
            resolvedPlan,
            stripeDaysUntilDue,
            endedAt: stripeEndedAt,
            stripeDiscountCouponId,
            trialStart: stripeTrialStart,
            trialEnd: stripeTrialEnd,
            cancelAt: stripeCancelAt,
            cancelAtPeriodEnd: stripeCancelAtPeriodEnd,
            canceledAt: stripeCanceledAt,
          },
        },
      },
    },
  })

  if (
    (stripeSubscriptionStatus === 'active' ||
      stripeSubscriptionStatus === 'trialing') &&
    resolvedPlan === 'PREMIUM'
  ) {
    console.log('colocar tudo (desbloquear o que esta bloqueado)-----------')

    const organizationId = userByStripeCustomerId.memberOn[0].organizationId
    const subscriptionEffectsService = new SubscriptionEffectsService()
    await subscriptionEffectsService.unblockAllEntityWhenSubscriptionUpdatesToPremium(
      organizationId,
    )
  }

  console.log('resolvedPlan')
  console.log(resolvedPlan)
  console.log('stripeSubscriptionStatus')
  console.log(stripeSubscriptionStatus)
}

export const handleProcessWebhookCancelSubscription = async (event: {
  object: Stripe.Subscription
}) => {
  const stripeCustomerId = event.object.customer
  const stripeCanceledSubscriptionId = event.object.id
  console.log('cancelar')

  // bloquear tudo

  const userByStripeCustomerId = await prisma.user.findFirst({
    where: {
      stripeCustomerId: stripeCustomerId.toString(),
    },
    select: {
      id: true,
      email: true,
      memberOn: {
        select: {
          organizationId: true,
        },
        where: {
          role: 'ADMIN',
        },
      },
    },
  })

  if (!userByStripeCustomerId) {
    throw new Error('User not found.')
  }

  await prisma.subscription.delete({
    where: {
      stripeSubscriptionId: stripeCanceledSubscriptionId.toString(),
    },
  })

  const {
    stripeSubscriptionId,
    stripeSubscriptionStatus,
    stripePriceId,
    stripeProductId,
    stripeStartDate,
    stripeCurrentPeriodStart,
    stripeCurrentPeriodEnd,
    stripeDaysUntilDue,
    stripeEndedAt,
    stripeCancelAt,
    stripeCancelAtPeriodEnd,
    stripeCanceledAt,
    stripeDiscountCouponId,
    stripeTrialStart,
    stripeTrialEnd,
  } = await addFreeSubscription(stripeCustomerId.toString())

  // talvez essa parte não seja necessaria pois o stripe dispara um evento de criação de subscrition (já tratado por nós)
  // mas prefiro que tudo seja feito de uma só vez
  const plan = getPlanByStripeId(stripePriceId)
  const planName = plan?.name ?? PLAN_NAMES.FREE
  const resolvedPlan = plan?.resolvendPlan ?? RESOLVED_PLAN_NAMES.FREE
  const subscriptionType = plan?.subscriptionType ?? SUBSCRIPTION_TYPE.MONTHLY

  await prisma.user.update({
    where: {
      id: userByStripeCustomerId.id,
    },
    data: {
      stripeCustomerId: stripeCustomerId.toString(),
      subscription: {
        create: {
          plan: planName,
          type: subscriptionType,
          resolvedPlan,
          startDate: stripeStartDate,
          currentPeriodStart: stripeCurrentPeriodStart,
          currentPeriodEnd: stripeCurrentPeriodEnd,
          status: stripeSubscriptionStatus,
          stripeSubscriptionId,
          stripePriceId,
          stripeProductId: stripeProductId.toString(),
          endedAt: stripeEndedAt,
          stripeDaysUntilDue,
          cancelAtPeriodEnd: stripeCancelAtPeriodEnd,
          cancelAt: stripeCancelAt,
          canceledAt: stripeCanceledAt,
          stripeDiscountCouponId,
          trialStart: stripeTrialStart,
          trialEnd: stripeTrialEnd,
        },
      },
    },
  })
  ///

  const organizationId = userByStripeCustomerId.memberOn[0].organizationId

  const subscriptionEffectsService = new SubscriptionEffectsService()

  await subscriptionEffectsService.blockAllEntityWhenSubscriptionUpdatesToFree(
    organizationId,
  )
}
