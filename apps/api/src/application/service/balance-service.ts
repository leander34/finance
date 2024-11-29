import type { Prisma } from '@prisma/client'
import { dayjs } from '@saas/core'
import dinero from 'dinero.js'

import { prisma } from '@/infra/database/prisma'
export class BalanceService {
  // constructor() {}

  async getPaidRevenues({
    organizationId,
    startDate,
    endDate,
    financialAccountId,
    creditCardId,
    visibledInOverallBalance,
  }: {
    organizationId: string
    startDate: string | null
    endDate: string | null
    financialAccountId?: string
    creditCardId?: string
    visibledInOverallBalance: boolean | null
  }) {
    // existe paid revenues e unpaid
    // então no final tudo isso será convertido um repository apenas buscar as receitas no banco dados, mas existirá essas duas funções para que não seja necessario mandar todos os filtros sempre, já que eles se repetem
    const paidRevenues = await prisma.transaction.aggregate({
      where: {
        financialAccountId,
        creditCardId: null,
        organizationId,
        type: 'REVENUE',
        status: 'PAID',
        // paidAt: {
        //   not: null,
        // },
        skip: false,
        realizationDate: {
          gte: startDate ?? undefined,
          lte: endDate ?? undefined,
        },
        OR:
          visibledInOverallBalance === null
            ? undefined
            : [
                {
                  financialAccount: {
                    visibledInOverallBalance,
                  },
                },
                {
                  creditCard: {
                    defaultPaymentAccount: {
                      visibledInOverallBalance,
                    },
                  },
                },
              ],
      },
      _sum: {
        amount: true,
      },
    })

    const paidRevenuesValue = dinero({
      amount: paidRevenues._sum.amount?.toNumber() ?? 0,
      currency: 'BRL',
    })

    return paidRevenuesValue
  }

  async getPaidExpenses({
    organizationId,
    startDate,
    endDate,
    financialAccountId,
    creditCardId,
    visibledInOverallBalance,
  }: {
    organizationId: string
    startDate: string | null
    endDate: string | null
    financialAccountId?: string
    creditCardId?: string
    visibledInOverallBalance: boolean | null
  }) {
    // existe paid revenues e unpaid
    // então no final tudo isso será convertido um repository apenas buscar as receitas no banco dados, mas existirá essas duas funções para que não seja necessario mandar todos os filtros sempre, já que eles se repetem
    const paidExpenses = await prisma.transaction.aggregate({
      where: {
        financialAccountId,
        creditCardId: null,
        organizationId,
        type: 'EXPENSE',
        status: 'PAID',
        // paidAt: {
        //   not: null,
        // },
        skip: false,
        realizationDate: {
          gte: startDate ?? undefined,
          lte: endDate ?? undefined,
        },
        OR:
          visibledInOverallBalance === null
            ? undefined
            : [
                {
                  financialAccount: {
                    visibledInOverallBalance,
                  },
                },
                {
                  creditCard: {
                    defaultPaymentAccount: {
                      visibledInOverallBalance,
                    },
                  },
                },
              ],
      },
      _sum: {
        amount: true,
      },
    })

    const paidExpensesValue = dinero({
      amount: paidExpenses._sum.amount?.toNumber() ?? 0,
      currency: 'BRL',
    })

    return paidExpensesValue
  }

  async getUnpaidRevenues({
    organizationId,
    startDate,
    endDate,
    financialAccountId,
    creditCardId,
    visibledInOverallBalance,
  }: {
    organizationId: string
    startDate: string | null
    endDate: string | null
    financialAccountId?: string
    creditCardId?: string
    visibledInOverallBalance: boolean | null
  }) {
    // existe paid revenues e unpaid
    // então no final tudo isso será convertido um repository apenas buscar as receitas no banco dados, mas existirá essas duas funções para que não seja necessario mandar todos os filtros sempre, já que eles se repetem
    const unpaidRevenues = await prisma.transaction.aggregate({
      where: {
        financialAccountId,
        creditCardId: null,
        organizationId,
        type: 'REVENUE',
        status: 'UNPAID',
        // paidAt: null,
        skip: false,
        realizationDate: {
          gte: startDate ?? undefined,
          lte: endDate ?? undefined,
        },
        OR:
          visibledInOverallBalance === null
            ? undefined
            : [
                {
                  financialAccount: {
                    visibledInOverallBalance,
                  },
                },
                {
                  creditCard: {
                    defaultPaymentAccount: {
                      visibledInOverallBalance,
                    },
                  },
                },
              ],
      },
      _sum: {
        amount: true,
      },
    })

    const unpaidRevenuesValue = dinero({
      amount: unpaidRevenues._sum.amount?.toNumber() ?? 0,
      currency: 'BRL',
    })

    return unpaidRevenuesValue
  }

  async getUnpaidExpenses({
    organizationId,
    startDate,
    endDate,
    financialAccountId,
    creditCardId,
    visibledInOverallBalance,
  }: {
    organizationId: string
    startDate: string | null
    endDate: string | null
    financialAccountId?: string
    creditCardId?: string
    visibledInOverallBalance: boolean | null
  }) {
    // existe paid revenues e unpaid
    // então no final tudo isso será convertido um repository apenas buscar as receitas no banco dados, mas existirá essas duas funções para que não seja necessario mandar todos os filtros sempre, já que eles se repetem
    const unpaidExpenses = await prisma.transaction.aggregate({
      where: {
        financialAccountId,
        creditCardId: null,
        organizationId,
        type: 'EXPENSE',
        status: 'UNPAID',
        // paidAt: null,
        skip: false,
        realizationDate: {
          gte: startDate ?? undefined,
          lte: endDate ?? undefined,
        },
        OR:
          visibledInOverallBalance === null
            ? undefined
            : [
                {
                  financialAccount: {
                    visibledInOverallBalance,
                  },
                },
                {
                  creditCard: {
                    defaultPaymentAccount: {
                      visibledInOverallBalance,
                    },
                  },
                },
              ],
      },
      _sum: {
        amount: true,
      },
    })

    const unpaidExpensesValue = dinero({
      amount: unpaidExpenses._sum.amount?.toNumber() ?? 0,
      currency: 'BRL',
    })

    return unpaidExpensesValue
  }

  async getUnpaidAndPaidRevenues({
    organizationId,
    startDate,
    endDate,
    financialAccountId,
    creditCardId,
    visibledInOverallBalance,
  }: {
    organizationId: string
    startDate: string | null
    endDate: string | null
    financialAccountId?: string
    creditCardId?: string
    visibledInOverallBalance: boolean | null
  }) {
    // existe paid revenues e unpaid
    // então no final tudo isso será convertido um repository apenas buscar as receitas no banco dados, mas existirá essas duas funções para que não seja necessario mandar todos os filtros sempre, já que eles se repetem
    const unpaidAndPaidRevenues = await prisma.transaction.aggregate({
      where: {
        financialAccountId,
        creditCardId: null,
        organizationId,
        type: 'REVENUE',
        status: {
          in: ['PAID', 'UNPAID'],
        },
        skip: false,
        realizationDate: {
          gte: startDate ?? undefined,
          lte: endDate ?? undefined,
        },
        OR:
          visibledInOverallBalance === null
            ? undefined
            : [
                {
                  financialAccount: {
                    visibledInOverallBalance,
                  },
                },
                {
                  creditCard: {
                    defaultPaymentAccount: {
                      visibledInOverallBalance,
                    },
                  },
                },
              ],
      },
      _sum: {
        amount: true,
      },
    })

    const unpaidAndPaidRevenuesValue = dinero({
      amount: unpaidAndPaidRevenues._sum.amount?.toNumber() ?? 0,
      currency: 'BRL',
    })

    return unpaidAndPaidRevenuesValue
  }

  async getExpectedRevenues({
    organizationId,
    startDate,
    endDate,
    financialAccountId,
    creditCardId,
    visibledInOverallBalance,
  }: {
    organizationId: string
    startDate: string | null
    endDate: string | null
    financialAccountId?: string
    creditCardId?: string
    visibledInOverallBalance: boolean | null
  }) {
    // existe paid revenues e unpaid
    // então no final tudo isso será convertido um repository apenas buscar as receitas no banco dados, mas existirá essas duas funções para que não seja necessario mandar todos os filtros sempre, já que eles se repetem
    const unpaidAndPaidRevenues = await prisma.transaction.aggregate({
      where: {
        financialAccountId,
        creditCardId: null,
        organizationId,
        type: 'REVENUE',
        status: {
          in: ['PAID', 'UNPAID'],
        },
        skip: false,
        realizationDate: {
          gte: startDate ?? undefined,
          lte: endDate ?? undefined,
        },
        OR:
          visibledInOverallBalance === null
            ? undefined
            : [
                {
                  financialAccount: {
                    visibledInOverallBalance,
                  },
                },
                {
                  creditCard: {
                    defaultPaymentAccount: {
                      visibledInOverallBalance,
                    },
                  },
                },
              ],
      },
      _sum: {
        amount: true,
      },
    })

    const transfers = await this.getTransfersFromAnAccount({
      organizationId,
      accountId: financialAccountId,
      startDate,
      endDate,
      transferType: 'RECEIVED',
      visibledInOverallBalance,
    })

    const unpaidAndPaidRevenuesValue = dinero({
      amount: unpaidAndPaidRevenues._sum.amount?.toNumber() ?? 0,
      currency: 'BRL',
    })

    return unpaidAndPaidRevenuesValue.add(transfers)
  }

  async getUnpaidAndPaidExpenses({
    organizationId,
    startDate,
    endDate,
    financialAccountId,
    creditCardId,
    visibledInOverallBalance,
  }: {
    organizationId: string
    startDate: string | null
    endDate: string | null
    financialAccountId?: string
    creditCardId?: string
    visibledInOverallBalance: boolean | null
  }) {
    // existe paid revenues e unpaid
    // então no final tudo isso será convertido um repository apenas buscar as receitas no banco dados, mas existirá essas duas funções para que não seja necessario mandar todos os filtros sempre, já que eles se repetem
    const unpaidAndPaidExpenses = await prisma.transaction.aggregate({
      where: {
        financialAccountId,
        creditCardId: null,
        organizationId,
        type: 'EXPENSE',
        status: {
          in: ['PAID', 'UNPAID'],
        },
        skip: false,
        realizationDate: {
          gte: startDate ?? undefined,
          lte: endDate ?? undefined,
        },
        OR:
          visibledInOverallBalance === null
            ? undefined
            : [
                {
                  financialAccount: {
                    visibledInOverallBalance,
                  },
                },
                {
                  creditCard: {
                    defaultPaymentAccount: {
                      visibledInOverallBalance,
                    },
                  },
                },
              ],
      },
      _sum: {
        amount: true,
      },
    })

    const unpaidAndPaidExpensesValue = dinero({
      amount: unpaidAndPaidExpenses._sum.amount?.toNumber() ?? 0,
      currency: 'BRL',
    })

    return unpaidAndPaidExpensesValue
  }

  async getExpectedExpenses({
    organizationId,
    startDate,
    endDate,
    financialAccountId,
    creditCardId,
    visibledInOverallBalance,
  }: {
    organizationId: string
    startDate: string | null
    endDate: string | null
    financialAccountId?: string
    creditCardId?: string
    visibledInOverallBalance: boolean | null
  }) {
    // existe paid revenues e unpaid
    // então no final tudo isso será convertido um repository apenas buscar as receitas no banco dados, mas existirá essas duas funções para que não seja necessario mandar todos os filtros sempre, já que eles se repetem
    const unpaidAndPaidExpenses = await prisma.transaction.aggregate({
      where: {
        financialAccountId,
        creditCardId: null,
        organizationId,
        type: 'EXPENSE',
        status: {
          in: ['PAID', 'UNPAID'],
        },
        skip: false,
        realizationDate: {
          gte: startDate ?? undefined,
          lte: endDate ?? undefined,
        },
        OR:
          visibledInOverallBalance === null
            ? undefined
            : [
                {
                  financialAccount: {
                    visibledInOverallBalance,
                  },
                },
                {
                  creditCard: {
                    defaultPaymentAccount: {
                      visibledInOverallBalance,
                    },
                  },
                },
              ],
      },
      _sum: {
        amount: true,
      },
    })

    const transfers = await this.getTransfersFromAnAccount({
      organizationId,
      accountId: financialAccountId,
      startDate,
      endDate,
      transferType: 'SENT',
      visibledInOverallBalance,
    })

    const unpaidAndPaidExpensesValue = dinero({
      amount: unpaidAndPaidExpenses._sum.amount?.toNumber() ?? 0,
      currency: 'BRL',
    })

    return unpaidAndPaidExpensesValue.add(transfers)
  }

  async getTransfersFromAnAccount({
    accountId,
    organizationId,
    startDate,
    endDate,
    visibledInOverallBalance,
    transferType = 'ALL',
  }: {
    accountId?: string
    organizationId: string
    startDate: string | null
    endDate: string | null
    visibledInOverallBalance: boolean | null
    transferType?: 'SENT' | 'RECEIVED' | 'ALL'
  }) {
    const where: Prisma.TransactionWhereInput = {
      organizationId,
      type: 'TRANSFER',
      realizationDate: {
        gte: startDate ?? undefined,
        lte: endDate ?? undefined,
      },
    }

    if (transferType === 'ALL') {
      where.OR = [
        {
          financialAccount:
            visibledInOverallBalance !== null
              ? {
                  visibledInOverallBalance,
                  id: accountId,
                }
              : {
                  id: accountId,
                },
        },
        {
          destinationFinancialAccount:
            visibledInOverallBalance !== null
              ? {
                  visibledInOverallBalance,
                  id: accountId,
                }
              : {
                  id: accountId,
                },
        },
      ]
    }

    if (transferType === 'SENT') {
      where.financialAccount =
        visibledInOverallBalance !== null
          ? {
              visibledInOverallBalance,
              id: accountId,
            }
          : {
              id: accountId,
            }
    }

    if (transferType === 'RECEIVED') {
      where.destinationFinancialAccount =
        visibledInOverallBalance !== null
          ? {
              visibledInOverallBalance,
              id: accountId,
            }
          : {
              id: accountId,
            }
    }

    const transfers = await prisma.transaction.findMany({
      where,
    })

    const result = transfers.reduce((acc, item) => {
      if (item.financialAccountId === accountId) {
        // representa uma saida
        return acc + item.amount.toNumber() * -1
      }

      if (item.destinationFinancialAccountId === accountId) {
        // representa uma entrada
        return acc + item.amount.toNumber()
      }

      return acc
    }, 0)

    const transfersResultValue = dinero({ amount: result, currency: 'BRL' })
    return transfersResultValue
  }

  async getRealMonthlyBalance({
    organizationId,
    startDate,
    endDate,
    financialAccountId,
    creditCardId,
    visibledInOverallBalance,
  }: {
    organizationId: string
    startDate: string
    endDate: string
    financialAccountId?: string
    creditCardId?: string
    visibledInOverallBalance: boolean | null
  }) {
    const paidRevenuesInTheMonthValue = await this.getPaidRevenues({
      organizationId,
      startDate,
      endDate,
      financialAccountId,
      creditCardId,
      visibledInOverallBalance,
    })

    const paidExpensesInTheMonthValue = await this.getPaidExpenses({
      organizationId,
      startDate,
      endDate,
      financialAccountId,
      creditCardId,
      visibledInOverallBalance,
    })

    const realMonthlyBalance = paidRevenuesInTheMonthValue.add(
      paidExpensesInTheMonthValue,
    )
    return realMonthlyBalance
  }

  async getExpectedMonthlyBalance({
    organizationId,
    endDate,
    startDate,
    financialAccountId,
    creditCardId,
    visibledInOverallBalance,
  }: {
    organizationId: string
    startDate: string
    endDate: string
    financialAccountId?: string
    creditCardId?: string
    visibledInOverallBalance: boolean | null
  }) {
    const unpaidAndPaidRevenuesInTheMonth = await this.getUnpaidAndPaidRevenues(
      {
        organizationId,
        startDate,
        endDate,
        financialAccountId,
        creditCardId,
        visibledInOverallBalance,
      },
    )

    const unpaidAndPaidExpensesInTheMonth = await this.getUnpaidAndPaidExpenses(
      {
        organizationId,
        startDate,
        endDate,
        financialAccountId,
        creditCardId,
        visibledInOverallBalance,
      },
    )

    const expectedMonthlyBalance = unpaidAndPaidRevenuesInTheMonth.add(
      unpaidAndPaidExpensesInTheMonth,
    )

    return expectedMonthlyBalance
  }

  /// ///////
  async getInitialBankingBalance({
    organizationId,
    financialAccountId,
    visibledInOverallBalance,
  }: {
    organizationId: string
    financialAccountId?: string
    visibledInOverallBalance: boolean | null
  }) {
    const initialBankingBalanceSum = await prisma.financialAccount.aggregate({
      where: {
        id: financialAccountId,
        organizationId,
        visibledInOverallBalance:
          visibledInOverallBalance !== null
            ? visibledInOverallBalance
            : undefined,
      },
      _sum: {
        initialBalance: true,
      },
    })

    const initialBankingBalance = dinero({
      amount: initialBankingBalanceSum._sum.initialBalance?.toNumber() ?? 0,
      currency: 'BRL',
    })

    return initialBankingBalance
  }

  async getAdjustmentTransactions({
    organizationId,
    financialAccountId,
    startDate,
    endDate,
    visibledInOverallBalance,
  }: {
    organizationId: string
    financialAccountId?: string
    startDate: string | null
    endDate: string | null
    visibledInOverallBalance: boolean | null
  }) {
    const previousAdjustments = await prisma.transaction.aggregate({
      where: {
        financialAccountId,
        organizationId,
        type: {
          in: ['NEGATIVE_ADJUSTMENT', 'POSITIVE_ADJUSTMENT'],
        },
        financialAccount:
          visibledInOverallBalance !== null
            ? {
                visibledInOverallBalance,
              }
            : undefined,
        realizationDate: {
          gte: startDate ?? undefined,
          lte: endDate ?? undefined,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const previousAdjustmentsValue = dinero({
      amount: previousAdjustments._sum.amount?.toNumber() ?? 0,
      currency: 'BRL',
    })

    return previousAdjustmentsValue
  }

  async getCurrentBankingBalance({
    organizationId,
    financialAccountId,
    visibledInOverallBalance,
  }: {
    organizationId: string
    financialAccountId?: string
    visibledInOverallBalance: boolean | null
  }) {
    // de todas as receitas pagas (sem data) (de todas as contas financeiras, que aparecem no saldo geral) (que não foram ignoradas)
    const paidRevenues = await this.getPaidRevenues({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate: null,
      visibledInOverallBalance,
    })
    // de todas as despesas pagas (sem data) (de todas as contas financeiras, que aparecem no saldo geral) (que não foram ignoradas)
    const paidExpenses = await this.getPaidExpenses({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate: null,
      visibledInOverallBalance,
    })
    // do saldo inicial das contas que podem aparecer na soma do saldo geral
    const initialBankingBalance = await this.getInitialBankingBalance({
      organizationId,
      financialAccountId,
      visibledInOverallBalance,
    })
    // de todos os ajustes de saldo
    const adjustmentTransactionsValue = await this.getAdjustmentTransactions({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate: null,
      visibledInOverallBalance,
    })

    const transfersValue = await this.getTransfersFromAnAccount({
      organizationId,
      accountId: financialAccountId,
      startDate: null,
      endDate: null,
      visibledInOverallBalance,
    })

    const currentBalanceWithAdjustmentTransactions = initialBankingBalance.add(
      adjustmentTransactionsValue,
    )

    const currentBalanceWithTransfers =
      currentBalanceWithAdjustmentTransactions.add(transfersValue)

    const currentBalanceWithRevenues =
      currentBalanceWithTransfers.add(paidRevenues)

    const currentBalance = currentBalanceWithRevenues.add(paidExpenses)
    return currentBalance
  }

  async getExpectedBankingBalanceForToday({
    organizationId,
    financialAccountId,
    visibledInOverallBalance,
  }: {
    organizationId: string
    financialAccountId?: string
    visibledInOverallBalance: boolean | null
  }) {
    // current balance
    const currentBankingBalance = await this.getCurrentBankingBalance({
      organizationId,
      financialAccountId,
      visibledInOverallBalance,
    })
    // somar com todas as receitas não pagas de hoje para tras
    const unpaidRevenues = await this.getUnpaidRevenues({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate: dayjs().format('YYYY-MM-DD'),
      visibledInOverallBalance,
    })
    // somar com todas as despesas não pagas de hoje para tras
    const unpaidExpenses = await this.getUnpaidExpenses({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate: dayjs().format('YYYY-MM-DD'),
      visibledInOverallBalance,
    })

    const expectedBankingBalanceForToday = currentBankingBalance
      .add(unpaidRevenues)
      .add(unpaidExpenses)
    return expectedBankingBalanceForToday
  }

  async getExpectedBankingBalanceOnASpecificDate({
    organizationId,
    financialAccountId,
    date,
    visibledInOverallBalance,
    // endDate,
  }: {
    organizationId: string
    financialAccountId?: string
    date: string | null
    visibledInOverallBalance: boolean | null
    // startDate: string | null
    // endDate: string | null
  }) {
    // de todas as receitas pagas (sem data) (de todas as contas financeiras, que aparecem no saldo geral) (que não foram ignoradas)
    const paidRevenues = await this.getPaidRevenues({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate: date,
      visibledInOverallBalance,
    })
    // de todas as despesas pagas (sem data) (de todas as contas financeiras, que aparecem no saldo geral) (que não foram ignoradas)
    const paidExpenses = await this.getPaidExpenses({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate: date,
      visibledInOverallBalance,
    })

    const unpaidRevenues = await this.getUnpaidRevenues({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate: date,
      visibledInOverallBalance,
    })
    // somar com todas as despesas não pagas de hoje para tras
    const unpaidExpenses = await this.getUnpaidExpenses({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate: date,
      visibledInOverallBalance,
    })
    // do saldo inicial das contas que podem aparecer na soma do saldo geral
    const initialBankingBalance = await this.getInitialBankingBalance({
      organizationId,
      financialAccountId,
      visibledInOverallBalance,
    })

    // de todos os ajustes de saldo
    const adjustmentTransactionsValue = await this.getAdjustmentTransactions({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate: date,
      visibledInOverallBalance,
    })

    const transfersValue = await this.getTransfersFromAnAccount({
      organizationId,
      accountId: financialAccountId,
      startDate: null,
      endDate: date,
      visibledInOverallBalance,
    })

    const currentBalanceWithAdjustmentTransactions = initialBankingBalance.add(
      adjustmentTransactionsValue,
    )

    const currentBalanceWithTransfers =
      currentBalanceWithAdjustmentTransactions.add(transfersValue)

    const currentBalanceWithRevenues =
      currentBalanceWithTransfers.add(paidRevenues)

    const currentBalance = currentBalanceWithRevenues.add(paidExpenses)
    const expectedBalance = currentBalance
      .add(unpaidExpenses)
      .add(unpaidRevenues)
    return expectedBalance
  }

  async getFinalBankBalanceOfAMonth({
    organizationId,
    financialAccountId,
    endDate,
    visibledInOverallBalance,
  }: {
    organizationId: string
    financialAccountId?: string
    // date: string | null
    // startDate: string | null
    endDate: string | null
    visibledInOverallBalance: boolean | null
  }) {
    const initialBankingBalance = await this.getInitialBankingBalance({
      organizationId,
      financialAccountId,
      visibledInOverallBalance,
    })

    // so coisas pagas

    const paidRevenues = await this.getPaidRevenues({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate,
      visibledInOverallBalance,
    })

    // de todas as despesas pagas (sem data) (de todas as contas financeiras, que aparecem no saldo geral) (que não foram ignoradas)
    const paidExpenses = await this.getPaidExpenses({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate,
      visibledInOverallBalance,
    })

    const adjustmentTransactionsValue = await this.getAdjustmentTransactions({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate,
      visibledInOverallBalance,
    })

    const transfersValue = await this.getTransfersFromAnAccount({
      organizationId,
      accountId: financialAccountId,
      startDate: null,
      endDate,
      visibledInOverallBalance,
    })

    const currentBalanceWithAdjustmentTransactions = initialBankingBalance.add(
      adjustmentTransactionsValue,
    )

    const currentBalanceWithTransfers =
      currentBalanceWithAdjustmentTransactions.add(transfersValue)

    const currentBalanceWithRevenues =
      currentBalanceWithTransfers.add(paidRevenues)

    const bankBalanceAtTheEndOfTheMonth =
      currentBalanceWithRevenues.add(paidExpenses)
    return bankBalanceAtTheEndOfTheMonth
  }

  async getCurrentBankingBalanceWihtoutInitialBalance({
    organizationId,
    financialAccountId,
    visibledInOverallBalance,
  }: {
    organizationId: string
    financialAccountId?: string
    visibledInOverallBalance: boolean | null
  }) {
    // de todas as receitas pagas (sem data) (de todas as contas financeiras, que aparecem no saldo geral) (que não foram ignoradas)
    const paidRevenues = await this.getPaidRevenues({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate: null,
      visibledInOverallBalance,
    })
    // de todas as despesas pagas (sem data) (de todas as contas financeiras, que aparecem no saldo geral) (que não foram ignoradas)
    const paidExpenses = await this.getPaidExpenses({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate: null,
      visibledInOverallBalance,
    })

    // de todos os ajustes de saldo
    const adjustmentTransactionsValue = await this.getAdjustmentTransactions({
      organizationId,
      financialAccountId,
      startDate: null,
      endDate: null,
      visibledInOverallBalance,
    })

    const transfersValue = await this.getTransfersFromAnAccount({
      organizationId,
      accountId: financialAccountId,
      startDate: null,
      endDate: null,
      visibledInOverallBalance,
    })

    const currentBalanceAdjustmentTransactions = adjustmentTransactionsValue

    const currentBalanceWithTransfers =
      currentBalanceAdjustmentTransactions.add(transfersValue)

    const currentBalanceWithRevenues =
      currentBalanceWithTransfers.add(paidRevenues)

    const currentBalance = currentBalanceWithRevenues.add(paidExpenses)
    return currentBalance
  }
}
