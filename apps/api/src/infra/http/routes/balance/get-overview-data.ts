import { dayjs } from '@saas/core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { BalanceService } from '@/application/service/balance-service'
import { CreditCardService } from '@/application/service/credit-card-service'
import { prisma } from '@/infra/database/prisma'

import { auth } from '../../middlewares/auth'

export async function getOverviewData(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/balance/overview',
      {
        schema: {
          tags: ['Monthly balance'],
          summary: 'Get real monthly balance',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            visibledInOverallBalance: z.boolean().nullish().default(null),
            month: z
              .number({ coerce: true })
              .refine(
                (value) =>
                  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(value),
                { message: 'Mês inválido.' },
              )
              .default(dayjs().get('month') + 1),
            year: z
              .number({
                coerce: true,
                invalid_type_error: 'Ano inválido.',
              })
              .default(dayjs().year()),
          }),
          response: {
            200: z.object({
              realMonthlyBalance: z.number(),
              expectedMonthlyBalance: z.number(),
              expectedRevenueOfTheMonth: z.number(),
              realRevenueOfTheMonth: z.number(),
              percentageOfRevenueComparedToLastMonth: z.number().nullable(),
              expectedExpenseOfTheMonth: z.number(),
              paidExpenseOfTheMonth: z.number(),
              unpaidExpenseOfTheMonth: z.number(),
              percentageOfExpenseComparedToLastMonth: z.number().nullable(),
              currentBankingBalance: z.number(),
              expectedBankingBalanceForToday: z.number(),
              creditCardsTransactionsOnSelectedMonth: z.number(),
              selectedInvoiceAmount: z.number(),
              selectedInvoiceAmountPaid: z.number(),
            }),
          },
        },
      },
      async (request, reply) => {
        const balanceService = new BalanceService()
        const creditCardService = new CreditCardService()
        await request.getCurrentUserId()
        const { slug } = request.params
        console.log('aquiidaid--------')
        const { organization } = await request.getUserMembership(slug)
        const { month, year, visibledInOverallBalance } = request.body
        const organizationId = organization.id
        const settedMonth = dayjs()
          .set('year', year)
          .set('month', month - 1)
        const startOfMonth = settedMonth.startOf('month').format('YYYY-MM-DD')
        const endOfMonth = settedMonth.endOf('month').format('YYYY-MM-DD')

        const { totalTransactionsValue, totalPaymentsValue } =
          await creditCardService.getTotalAmountOfCreditCardTransactionsAndPayments(
            {
              creditCardIds: null,
              organizationId: organization.id,
              invoiceId: null,
              startDate: startOfMonth,
              endDate: endOfMonth,
              invoiceMonth: null,
              invoiceYear: null,
            },
          )
        const availableLimitUsed = totalTransactionsValue
          .subtract(totalPaymentsValue)
          .multiply(-1)

        const realMonthlyBalance = await balanceService.getRealMonthlyBalance({
          organizationId,
          startDate: startOfMonth,
          endDate: endOfMonth,
          visibledInOverallBalance,
        })

        const expectedMonthlyBalancePartial =
          await balanceService.getExpectedMonthlyBalance({
            organizationId,
            startDate: startOfMonth,
            endDate: endOfMonth,
            visibledInOverallBalance,
          })

        const expectedMonthlyBalance =
          expectedMonthlyBalancePartial.add(availableLimitUsed)

        const expectedRevenueOfTheMonth =
          await balanceService.getUnpaidAndPaidRevenues({
            organizationId,
            startDate: startOfMonth,
            endDate: endOfMonth,
            visibledInOverallBalance,
          })

        const expectedRevenueFromThePreviousMonth =
          await balanceService.getUnpaidAndPaidRevenues({
            organizationId,
            startDate: dayjs(startOfMonth)
              .subtract(1, 'month')
              .startOf('month')
              .format('YYYY-MM-DD'),
            endDate: dayjs(endOfMonth)
              .subtract(1, 'month')
              .endOf('month')
              .format('YYYY-MM-DD'),
            visibledInOverallBalance,
          })

        let percentageOfRevenueComparedToLastMonth = null

        if (expectedRevenueFromThePreviousMonth.getAmount() > 0) {
          percentageOfRevenueComparedToLastMonth =
            expectedRevenueOfTheMonth
              .subtract(expectedRevenueFromThePreviousMonth)
              .divide(expectedRevenueFromThePreviousMonth.getAmount() / 100)
              .multiply(100)
              .getAmount() / 100
        }

        const realRevenueOfTheMonth = await balanceService.getPaidRevenues({
          organizationId,
          startDate: startOfMonth,
          endDate: endOfMonth,
          visibledInOverallBalance,
        })
        // const expectedExpenseOfTheMonth =
        //
        // alerta
        const {
          totalTransactionsValue: totalTransactionsValuePreviousMonth,
          totalPaymentsValue: totalPaymentsValuePreviousMonth,
        } =
          await creditCardService.getTotalAmountOfCreditCardTransactionsAndPayments(
            {
              creditCardIds: null,
              organizationId: organization.id,
              invoiceId: null,
              startDate: settedMonth
                .subtract(1, 'month')
                .startOf('month')
                .format('YYYY-MM-YY'),
              endDate: settedMonth
                .subtract(1, 'month')
                .endOf('month')
                .format('YYYY-MM-YY'),
              invoiceMonth: null,
              invoiceYear: null,
              // invoiceMonth: settedMonth.subtract(1, 'month').month() + 1,
              // invoiceYear: settedMonth.subtract(1, 'month').year(),
            },
          )
        const availableLimitUsedProviousMonth =
          totalTransactionsValuePreviousMonth
            .subtract(totalPaymentsValuePreviousMonth)
            .multiply(-1)

        const expectedExpenseOfTheMonthPartial =
          await balanceService.getUnpaidAndPaidExpenses({
            organizationId,
            startDate: startOfMonth,
            endDate: endOfMonth,
            visibledInOverallBalance,
          })

        const expectedExpenseOfTheMonth =
          expectedExpenseOfTheMonthPartial.add(availableLimitUsed)

        const expectedExpenseFromThePreviousMonthPartial =
          await balanceService.getUnpaidAndPaidExpenses({
            organizationId,
            startDate: dayjs(startOfMonth)
              .subtract(1, 'month')
              .startOf('month')
              .format('YYYY-MM-DD'),
            endDate: dayjs(endOfMonth)
              .subtract(1, 'month')
              .endOf('month')
              .format('YYYY-MM-DD'),
            visibledInOverallBalance,
          })

        const expectedExpenseFromThePreviousMonth =
          expectedExpenseFromThePreviousMonthPartial.add(
            availableLimitUsedProviousMonth,
          )

        let percentageOfExpenseComparedToLastMonth = null

        if (expectedExpenseFromThePreviousMonth.getAmount() * -1 > 0) {
          percentageOfExpenseComparedToLastMonth =
            expectedExpenseOfTheMonth
              .multiply(-1)
              .subtract(expectedExpenseFromThePreviousMonth.multiply(-1))
              .divide(
                expectedExpenseFromThePreviousMonth.multiply(-1).getAmount() /
                  100,
              )
              .multiply(100)
              .getAmount() / 100
        }

        const paidExpenseOfTheMonth = await balanceService.getPaidExpenses({
          organizationId,
          startDate: startOfMonth,
          endDate: endOfMonth,
          visibledInOverallBalance,
        })

        const unpaidExpenseOfTheMonthPartial =
          await balanceService.getUnpaidExpenses({
            organizationId,
            startDate: startOfMonth,
            endDate: endOfMonth,
            visibledInOverallBalance,
          })

        const unpaidExpenseOfTheMonth =
          unpaidExpenseOfTheMonthPartial.add(availableLimitUsed)
        //

        const currentBankingBalance =
          await balanceService.getCurrentBankingBalance({
            organizationId,
            visibledInOverallBalance,
          })
        const expectedBankingBalanceForTodayPartial =
          await balanceService.getExpectedBankingBalanceForToday({
            organizationId,
            visibledInOverallBalance,
          })

        // procurar as faturas que vencem hoje e verificar o valor delas, com os pagamentos
        // alerta
        const {
          totalTransactionsValue: totalValueOfInvoicesDueToday,
          totalPaymentsValue: totalAmountOfPaymentsOnInvoicesDueToday,
        } =
          await creditCardService.getTotalAmountOfCreditCardTransactionsAndPayments(
            {
              creditCardIds: null,
              organizationId: organization.id,
              invoiceId: null,
              startDate: null,
              endDate: dayjs().format('YYYY-MM-DD'),
              invoiceMonth: null,
              invoiceYear: null,
            },
          )

        const amountThatNeedsToBePaidOnTodaysBills =
          totalValueOfInvoicesDueToday.subtract(
            totalAmountOfPaymentsOnInvoicesDueToday,
          )

        const expectedBankingBalanceForToday =
          expectedBankingBalanceForTodayPartial.subtract(
            amountThatNeedsToBePaidOnTodaysBills,
          )

        // credit-card

        // pegar todas as compras no cartao de credito no mês selecionado

        const creditCardsTransactions = await prisma.transaction.findMany({
          where: {
            financialAccountId: null,
            creditCardId: {
              not: null,
            },
            skip: false,
            type: 'EXPENSE',
            realizationDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        })

        const creditCardsTransactionsOnSelectedMonth =
          creditCardsTransactions.reduce((sum, item) => {
            return sum + item.amount.toNumber() * -1
          }, 0)

        // valor da fatura do mês

        const {
          totalTransactionsValue: totalTransactionsValueOnCurrentInvoices,
          totalPaymentsValue: totalPaymentsValueOnCurrentInvoices,
        } =
          await creditCardService.getTotalAmountOfCreditCardTransactionsAndPayments(
            {
              creditCardIds: null,
              organizationId: organization.id,
              invoiceId: null,
              startDate: null,
              endDate: null,
              invoiceMonth: settedMonth.month() + 1,
              invoiceYear: settedMonth.year(),
            },
          )

        const selectedInvoiceAmount =
          totalTransactionsValueOnCurrentInvoices.subtract(
            totalPaymentsValueOnCurrentInvoices,
          )

        return reply.send({
          realMonthlyBalance: realMonthlyBalance.getAmount() / 100,
          expectedMonthlyBalance: expectedMonthlyBalance.getAmount() / 100,
          expectedRevenueOfTheMonth:
            expectedRevenueOfTheMonth.getAmount() / 100,
          realRevenueOfTheMonth: realRevenueOfTheMonth.getAmount() / 100,
          percentageOfRevenueComparedToLastMonth,
          expectedExpenseOfTheMonth:
            expectedExpenseOfTheMonth.getAmount() / 100,
          paidExpenseOfTheMonth: paidExpenseOfTheMonth.getAmount() / 100,
          unpaidExpenseOfTheMonth: unpaidExpenseOfTheMonth.getAmount() / 100,
          percentageOfExpenseComparedToLastMonth,
          currentBankingBalance: currentBankingBalance.getAmount() / 100,
          expectedBankingBalanceForToday:
            expectedBankingBalanceForToday.getAmount() / 100,
          //   expectedBalanceOfTheDay: 0
          creditCardsTransactionsOnSelectedMonth:
            creditCardsTransactionsOnSelectedMonth / 100,
          selectedInvoiceAmount: selectedInvoiceAmount.getAmount() / 100,
          selectedInvoiceAmountPaid:
            totalPaymentsValueOnCurrentInvoices.getAmount() / 100,
        })
      },
    )
}
