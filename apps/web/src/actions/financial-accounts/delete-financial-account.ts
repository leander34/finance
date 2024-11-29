'use server'

import { HTTPError } from 'ky'

import {
  getCurrentOrganizationSlug,
  getUserProfileServer,
} from '@/auth/session-server-only'
import { deleteFinancialAccountHttp } from '@/http/financial-accounts/delete-financial-account-http'

export async function deleteFinancialAccountAction(financialAccountId: string) {
  await getUserProfileServer()
  const currentOrg = getCurrentOrganizationSlug()
  try {
    await deleteFinancialAccountHttp({
      slug: currentOrg!,
      financialAccountId,
    })
    return {
      success: true,
      message: 'Conta deletada com sucesso.',
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
