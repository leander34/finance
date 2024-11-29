'use server'

import { HTTPError } from 'ky'

import {
  getCurrentOrganizationSlug,
  getUserProfileServer,
} from '@/auth/session-server-only'
import { archiveCreditCardHttp } from '@/http/credit-cards/archive-credit-card-http'

export async function archiveCreditCardAction(creditCardId: string) {
  await getUserProfileServer()
  const currentOrg = getCurrentOrganizationSlug()
  try {
    await archiveCreditCardHttp({
      slug: currentOrg!,
      creditCardId,
    })
    return {
      success: true,
      message: 'Cartão arquivada com sucesso.',
      errors: null,
    }
  } catch (error) {
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
}
