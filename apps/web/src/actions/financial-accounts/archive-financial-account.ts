'use server'

import { HTTPError } from 'ky'

import {
  getCurrentOrganizationSlug,
  getUserProfileServer,
} from '@/auth/session-server-only'
import { archiveFinancialAccountHttp } from '@/http/financial-accounts/archive-financial-account-http'

export async function archiveFinancialAccountAction(
  financialAccountId: string,
) {
  await getUserProfileServer()
  const currentOrg = getCurrentOrganizationSlug()
  try {
    await archiveFinancialAccountHttp({
      slug: currentOrg!,
      financialAccountId,
    })
    return {
      success: true,
      message: 'Conta arquivada com sucesso.',
      errors: null,
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json()
      return { success: false, message, errors: null }
    }
    console.log(error)

    return {
      success: false,
      message: 'Erro inesperado, tente novamente em alguns minutos.',
      errors: null,
    }
  }
}
