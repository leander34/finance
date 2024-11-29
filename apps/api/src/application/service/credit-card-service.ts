import type { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import dinero from 'dinero.js'

import { prisma } from '@/infra/database/prisma'
export class CreditCardService {
  //   async getCreditCardInvoice({
  //     organizationId,
  //     creditCardId,
  //   }: {
  //     organizationId: string
  //     creditCardId: string
  //   }) {}

  // async getCreditCardInvoicesValue({
  //   organizationId,
  //   creditCardIds,
  //   startDate,
  //   endDate,
  // }: {
  //   organizationId: string
  //   creditCardIds: string[] | null
  //   startDate: string
  //   endDate: string
  // }) {
  //   const invoices = await prisma.creditCardInvoice.findMany({
  //     where: {
  //       creditCard: {
  //         id: {
  //           in: creditCardIds ?? undefined,
  //         },
  //         organizationId,
  //       },
  //       dueDate: {
  //         gte: startDate,
  //         lte: endDate,
  //       },
  //     },
  //     include: {
  //       transactions: true,
  //     },
  //   })

  //   // const value = invoices.reduce((sum, item) => {
  //   //   return sum + item.
  //   // }, 0)
  // }

  async getCurrentCreditCardInvoice({
    organizationId,
    creditCardId,
  }: {
    organizationId: string
    creditCardId: string
  }) {
    const date = dayjs().format('YYYY-MM-DD')
    const currentInvoice = await prisma.creditCardInvoice.findFirst({
      where: {
        AND: [
          {
            creditCard: {
              AND: [
                {
                  id: creditCardId,
                },
                {
                  organizationId,
                },
              ],
            },
          },
          {
            periodStart: {
              lte: date,
            },
          },
          {
            periodEnd: {
              gte: date,
            },
          },
        ],
      },
    })

    return currentInvoice
  }

  async getCurrentAndNextCreditCardInvoice({
    organizationId,
    creditCardId,
  }: {
    organizationId: string
    creditCardId: string
  }) {
    const currentInvoice = await this.getCurrentCreditCardInvoice({
      organizationId,
      creditCardId,
    })
    if (!currentInvoice) {
      return []
    }

    // const periodEnd = currentInvoice.periodEnd

    const nextInvoices = await this.getNextCreditCardInvoices({
      organizationId,
      creditCardId,
    })

    return [currentInvoice, ...nextInvoices]
  }

  async getNextCreditCardInvoices({
    organizationId,
    creditCardId,
  }: {
    organizationId: string
    creditCardId: string
  }) {
    const currentCreditCardInvoice = await this.getCurrentCreditCardInvoice({
      organizationId,
      creditCardId,
    })

    if (!currentCreditCardInvoice) {
      return []
    }
    const nextInvoices = await prisma.creditCardInvoice.findMany({
      where: {
        AND: [
          {
            creditCard: {
              AND: [
                {
                  id: creditCardId,
                },
                {
                  organizationId,
                },
              ],
            },
          },
          {
            periodStart: {
              gt: currentCreditCardInvoice.periodEnd,
            },
          },
        ],
      },
    })

    return nextInvoices
  }

  async getTotalAmountOfCreditCardTransactionsAndPayments({
    organizationId,
    creditCardIds,
    invoiceId,
    startDate,
    endDate,
    invoiceMonth,
    invoiceYear,
    futureTransaction,
  }: {
    organizationId: string
    invoiceId: string | null
    creditCardIds: string[] | null
    startDate: string | null
    endDate: string | null
    invoiceMonth: number | null
    invoiceYear: number | null
    futureTransaction?: boolean
  }) {
    const where: Prisma.CreditCardInvoiceWhereInput = {
      id: invoiceId ?? undefined,
      creditCard: {
        id: {
          in: creditCardIds ?? undefined,
        },
        organizationId,
      },
    }

    if (startDate || endDate) {
      where.dueDate = {
        gte: startDate ?? undefined,
        lte: endDate ?? undefined,
      }
    }

    if (invoiceMonth) {
      where.month = invoiceMonth
    }

    if (invoiceYear) {
      where.year = invoiceYear
    }

    const creditCardInvoices = await prisma.creditCardInvoice.findMany({
      where,
      select: {
        invoicePayments: true,
        transactions: {
          where: {
            futureTransaction: futureTransaction ?? undefined,
          },
        },
      },
    })

    const { transactions, payments } = creditCardInvoices.reduce(
      (acc, item) => {
        const t = item.transactions.reduce((sum, item) => {
          return sum + item.amount.toNumber() * -1
        }, 0)

        const p = item.invoicePayments.reduce((sum, item) => {
          return sum + item.amount.toNumber() * -1
        }, 0)

        return {
          transactions: acc.transactions + t,
          payments: acc.payments + p,
        }
      },
      {
        transactions: 0,
        payments: 0,
      },
    )

    const totalTransactionsValue = transactions
    const totalPaymentsValue = payments
    // for (const invoices of creditCardInvoices) {
    //   totalTransactionsValue = invoices.transactions.reduce((sum, item) => {
    //     totalTransactionsValue += item.amount.toNumber() * -1
    //     return sum + item.amount.toNumber() * -1
    //   }, 0)

    //   totalPaymentsValue = invoices.invoicePayments.reduce((sum, item) => {
    //     return sum + item.amount.toNumber() * -1
    //   }, 0)
    // }

    return {
      totalTransactionsValue: dinero({
        amount: totalTransactionsValue,
        currency: 'BRL',
      }),
      totalPaymentsValue: dinero({
        amount: totalPaymentsValue,
        currency: 'BRL',
      }),
    }
  }

  async getTotalCreditCardsLimit({
    organizationId,
    creditCardIds,
  }: {
    organizationId: string
    creditCardIds: string[] | null
  }) {
    const creditCards = await prisma.creditCard.findMany({
      where: {
        id: {
          in: creditCardIds ?? undefined,
        },
        organizationId,
      },
    })

    const totalLimit = creditCards.reduce((sum, item) => {
      return sum + item.limit.toNumber()
    }, 0)

    return dinero({ amount: totalLimit, currency: 'BRL' })
  }

  async getCreditCardsAvailableLimit({
    organizationId,
    creditCardIds,
  }: {
    organizationId: string
    creditCardIds: string[] | null
  }) {
    const totalLimit = await this.getTotalCreditCardsLimit({
      creditCardIds,
      organizationId,
    })

    const { totalTransactionsValue, totalPaymentsValue } =
      await this.getTotalAmountOfCreditCardTransactionsAndPayments({
        creditCardIds,
        organizationId,
        invoiceId: null,
        startDate: null,
        endDate: null,
        invoiceMonth: null,
        invoiceYear: null,
        futureTransaction: false,
      })

    const totalUsedLimit = totalTransactionsValue.subtract(totalPaymentsValue)

    return totalLimit.subtract(totalUsedLimit)
  }

  //   async getAllCreditCardInvoices() {}

  //   todos
  //   async getCreditCardsInvoice() {}
  //   async getCurrentCreditCardsInvoice() {}
  //   async getAllCreditCardsInvoices() {}
  //   async getNextCreditCardsInvoices() {}
}
