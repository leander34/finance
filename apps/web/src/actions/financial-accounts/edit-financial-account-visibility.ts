'use server'

import { HTTPError } from 'ky'

import {
  getCurrentOrganizationSlug,
  getUserProfileServer,
} from '@/auth/session-server-only'
import { editFinancialAccountVisibilityHttp } from '@/http/financial-accounts/edit-financial-account-visibility-http'

export async function editFinancialAccountVisibilityAction({
  financialAccountId,
  visibledInOverallBalance,
}: {
  financialAccountId: string
  visibledInOverallBalance: boolean
}) {
  await getUserProfileServer()
  const currentOrg = getCurrentOrganizationSlug()
  try {
    await editFinancialAccountVisibilityHttp({
      slug: currentOrg!,
      financialAccountId,
      visibledInOverallBalance,
    })
    return {
      success: true,
      message: 'Ação concluída com sucesso.',
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
