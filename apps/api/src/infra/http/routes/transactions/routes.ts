import type { FastifyInstance } from 'fastify'

import { createTransaction } from './create-transaction'
import { createTransfer } from './create-transfer'
import { editTransaction } from './edit-transaction'
import { fetchTransactions } from './fetch-transactions'
import { getAccountsAndCreditCards } from './get-accounts-and-credit-cards'
import { markATransactionAsPaid } from './mark-a-transaction-as-paid'
// import { markATransactionAsUnpaid } from './mark-a-transaction-as-unpaid'
import { monthlyRevenueExpenseChart } from './monthly-revenue-expense-chart'
// import { markAnRevenueTransactionAsPaid } from './mark-an-revenue-transaction-as-paid'

export async function transactionsRoutes(app: FastifyInstance) {
  app.register(createTransaction)
  app.register(createTransfer)
  app.register(editTransaction)
  app.register(markATransactionAsPaid)
  // app.register(markATransactionAsUnpaid)
  // app.register(markAnRevenueTransactionAsPaid)
  app.register(getAccountsAndCreditCards)
  app.register(fetchTransactions)
  app.register(monthlyRevenueExpenseChart)
}
