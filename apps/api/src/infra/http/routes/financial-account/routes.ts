import type { FastifyInstance } from 'fastify'

import { adjustFinancialAccountBalance } from './adjust-financial-account-balance'
import { archiveFinancialAccount } from './archive-financial-account'
import { block } from './block'
import { createFinancialAccount } from './create-financial-account'
import { deleteFinancialAccount } from './delete-financial-account'
import { editFinancialAccount } from './edit-financial-account'
import { editFinancialAccountVisibility } from './edit-financial-account-visibility'
import { fetchFinancialAccounts } from './fetch-financial-accounts'
import { fetchFinancialAccountsWithDetails } from './fetch-financial-accounts-with-details'
import { fetchMostActiveFinancialAccounts } from './fetch-most-active-financial-accounts'
import { fetchOverviewFinancialAccounts } from './fetch-overview-financial-accounts'
import { unarchiveFinancialAccount } from './unarchive-financial-account'

export async function financialAccountsRoutes(app: FastifyInstance) {
  app.register(createFinancialAccount)
  app.register(editFinancialAccount)
  app.register(archiveFinancialAccount)
  app.register(unarchiveFinancialAccount)
  app.register(deleteFinancialAccount)
  app.register(adjustFinancialAccountBalance)
  app.register(fetchMostActiveFinancialAccounts)
  app.register(fetchOverviewFinancialAccounts)
  app.register(fetchFinancialAccountsWithDetails)
  app.register(editFinancialAccountVisibility)
  app.register(block)
  app.register(fetchFinancialAccounts)
}
