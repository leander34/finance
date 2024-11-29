'use server'
import type { PlanNamesType } from '@saas/core'
import { env } from '@saas/env'
import { HTTPError } from 'ky'
import { redirect } from 'next/navigation'

import { getCurrentOrganizationSlug } from '@/auth/session-server-only'
import { manageSubscriptionOnBillingPortalHttp } from '@/http/auth/user/manage-subscription-on-billing-portal-http'
import { updateSubscriptionOnBillingPortalHttp } from '@/http/auth/user/update-subscription-on-billing-portal-http'

// retornar os erros depois
export async function updateSubscritionBillingPortalSessionAction(
  updateToPlan: PlanNamesType,
) {
  // const { user } = await getUserProfileServer()
  console.log('oi')
  // verificar a ability para alterar
  const currentOrg = getCurrentOrganizationSlug()
  const returnUrl = `${env.NEXT_PUBLIC_URL}/o/${currentOrg}/configuracoes/assinaturas`
  const returnSuccessUpdateUrl = `${env.NEXT_PUBLIC_URL}/o/${currentOrg}/dashboard?sup=true`
  let response
  try {
    // if (user.subscription.currentPlan === updateToPlan) {
    //   return {
    //     success: false,
    //     message: `Seu plano atual já é o ${user.subscription.resolvedPlan}`,
    //     errors: null,
    //   }
    // }

    // if (!stripePlans[updateToPlan as keyof typeof stripePlans]) {
    //   return {
    //     success: false,
    //     message: 'Plano escolhido não existe.',
    //     errors: null,
    //   }
    // }

    // const newPlan = stripePlans[updateToPlan as keyof typeof stripePlans]
    // if (newPlan.name === PLAN_NAMES.FREE) {
    //   return {
    //     success: false,
    //     message: 'Não é possivel atualizar o plano para o Free.',
    //     errors: null,
    //   }
    // }

    // const currentPlanResolved = user.subscription.resolvedPlan
    // const isPremium = currentPlanResolved === RESOLVED_PLAN_NAMES.PREMIUM

    // if (isPremium) {
    //   return {
    //     success: false,
    //     message: 'Você é um assinante Premium.',
    //     errors: null,
    //   }
    // }

    response = await updateSubscriptionOnBillingPortalHttp({
      updateToPlan,
      returnUrl,
      returnSuccessUpdateUrl,
    })
  } catch (error) {
    console.log(error)
    if (error instanceof HTTPError) {
      const { message } = await error.response.json()
      return { success: false, message, errors: null }
    }

    return {
      success: false,
      message: 'Erro inesperado, tente novamente em alguns minutos.',
      errors: null,
    }
  }
  const { url } = response
  redirect(url)
}

export async function manageSubscriptionBillingPortalSessionAction() {
  // const { user } = await getUserProfileServer()
  // verificar a ability para alterar
  const currentOrg = getCurrentOrganizationSlug()
  const returnUrl = `${env.NEXT_PUBLIC_URL}/o/${currentOrg}/configuracoes/assinaturas`

  let response
  try {
    response = await manageSubscriptionOnBillingPortalHttp({ returnUrl })
  } catch (error) {
    console.log(error)
    if (error instanceof HTTPError) {
      const { message } = await error.response.json()
      return { success: false, message, errors: null }
    }

    return {
      success: false,
      message: 'Erro inesperado, tente novamente em alguns minutos.',
      errors: null,
    }
  }
  const { url } = response
  redirect(url)
}
