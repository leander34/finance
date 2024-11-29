import type { FastifyInstance } from 'fastify'

import { archiveCreditCard } from './archive-credit-card'
import { createCreditCard } from './create-credit-card'
import { deleteCreditCard } from './delete-credit-card'
import { deletePaymentsFromACreditCardInvoice } from './delete-payments-from-a-credit-card-invoice'
import { editCreditCard } from './edit-credit-card'
import { fetchCreditCardsWidget } from './fetch-credit-cards-widget'
import { fetchCreditCardsWithDetails } from './fetch-credit-cards-with-details'
import { getCreditCardsOverview } from './get-credit-cards-overview'
import { payCreditCardInvoice } from './pay-credit-card-invoice'
import { unarchiveCreditCard } from './unarchive-credit-card'

export async function creditCardsRoutes(app: FastifyInstance) {
  app.register(createCreditCard)
  app.register(editCreditCard)
  app.register(deleteCreditCard)
  app.register(archiveCreditCard)
  app.register(unarchiveCreditCard)
  app.register(fetchCreditCardsWithDetails)
  app.register(getCreditCardsOverview)
  app.register(fetchCreditCardsWidget)
  app.register(payCreditCardInvoice)
  app.register(deletePaymentsFromACreditCardInvoice)
}
