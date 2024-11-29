'use server'

import { HTTPError } from 'ky'

import {
  getCurrentOrganizationSlug,
  getUserProfileServer,
} from '@/auth/session-server-only'
import { unarchiveFinancialAccountHttp } from '@/http/financial-accounts/unarchive-financial-account-http'

export async function unarchiveFinancialAccountAction(
  financialAccountId: string,
) {
  await getUserProfileServer()
  const currentOrg = getCurrentOrganizationSlug()
  try {
    await unarchiveFinancialAccountHttp({
      slug: currentOrg!,
      financialAccountId,
    })
    return {
      success: true,
      message: 'Conta desarquivada com sucesso.',
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
