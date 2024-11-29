'use client'

import { dayjs, fakeDelay, moneyFormatter } from '@saas/core'
import { useQuery } from '@tanstack/react-query'
import {
  CirclePlus,
  EllipsisVertical,
  HandCoins,
  HelpCircle,
  Loader2,
  Maximize2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  X,
  XCircle,
} from 'lucide-react'
import Image from 'next/image'
import { useParams, useSearchParams } from 'next/navigation'
import qs from 'query-string'
import { useState } from 'react'

import { CreateOrUpdateFinancialAccountModal } from '@/components/global/create-or-update-financial-account-modal'
import { PageContentContainer } from '@/components/global/page-content-container'
import { useNewTransaction } from '@/components/new-transaction/hook'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getOverviewDataHttp } from '@/http/balance/get-overview-data'
import { fetchFinancialAccountsWithDetailsHttp } from '@/http/financial-accounts/fetch-financial-accounts-with-details'
import { cn } from '@/lib/utils'

import { columns } from './_components/_financial-accounts/columns'
import { DataTable } from './_components/_financial-accounts/data-table'
import { AccountActionsDropdown } from './_components/account-actions-dropdown'
export default function ContasFinanceirasPage() {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  const { handleChangeNewTransactionSheet } = useNewTransaction()
  const [showFinancialAccountModal, setShowFinancialAccountModal] =
    useState(false)
  // const [currentPage, setCurrentPage] = useState(1)

  const searchParams = useSearchParams()
  const currentSelectedDate =
    searchParams.get('data-inicio') ??
    dayjs().startOf('month').format('YYYY-MM-DD')

  const { data, isLoading } = useQuery({
    queryKey: [
      'primary',
      'financial-accounts',
      currentOrg,
      dayjs(currentSelectedDate).startOf('month').format('YYYY-MM-DD'),
    ],
    queryFn: async () => {
      // await fakeDelay(3000)
      return fetchFinancialAccountsWithDetailsHttp({
        slug: currentOrg,
        page: 1,
        month: dayjs(currentSelectedDate).startOf('month').month() + 1,
        year: dayjs(currentSelectedDate).year(),
      })
    },
  })

  const { data: balanceData, isLoading: isLoadingBalance } = useQuery({
    queryKey: [
      'primary',
      'overview',
      currentOrg,
      dayjs(currentSelectedDate).startOf('month').format('YYYY-MM-DD'),
      null,
    ],
    queryFn: async () => {
      // await fakeDelay(5000)
      return getOverviewDataHttp({
        slug: currentOrg,
        month: dayjs(currentSelectedDate).startOf('month').month() + 1,
        year: dayjs(currentSelectedDate).year(),
        visibledInOverallBalance: null,
      })
    },
  })

  return (
    <PageContentContainer className="relative">
      {/* <h1 className="text-xl">Minhas contas</h1> */}
      {/* {JSON.stringify(data, null, 2)} */}
      <div className="flex gap-10">
        <div className="w-full space-y-6">
          {/* <DataTable data={[]} columns={columns} /> */}
          <div className="flex flex-wrap gap-4">
            <div className="">
              <Button
                type="button"
                onClick={() => setShowFinancialAccountModal(true)}
                variant="outline"
                className="flex h-full min-h-[300px] min-w-[400px] flex-col items-center justify-center gap-1"
              >
                <CirclePlus
                  className="size-10 text-muted-foreground group-hover:text-foreground"
                  strokeWidth={1.2}
                />
                <span className="text-sm leading-none tracking-tight text-muted-foreground">
                  Nova conta
                </span>
              </Button>
            </div>
            {isLoading ? (
              <>
                <div className="flex h-full min-h-[300px] min-w-[400px] flex-col items-center justify-center gap-1 rounded-md border bg-primary-foreground">
                  <Loader2
                    className="size-6 animate-spin text-muted-foreground"
                    strokeWidth={1.2}
                  />
                </div>
                <div className="flex h-full min-h-[300px] min-w-[400px] flex-col items-center justify-center gap-1 rounded-md border bg-primary-foreground">
                  <Loader2
                    className="size-6 animate-spin text-muted-foreground"
                    strokeWidth={1.2}
                  />
                </div>
                <div className="flex h-full min-h-[300px] min-w-[400px] flex-col items-center justify-center gap-1 rounded-md border bg-primary-foreground">
                  <Loader2
                    className="size-6 animate-spin text-muted-foreground"
                    strokeWidth={1.2}
                  />
                </div>
              </>
            ) : (
              data?.financialAccounts.map((account) => {
                return (
                  <Card
                    key={account.id}
                    className="flex min-h-[300px] min-w-[400px] flex-col"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-2">
                        <Image
                          src={account.bank.imageUrl}
                          alt="Imagem do banco"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {account.name}
                          </CardTitle>
                          <CardDescription>{account.bank.name}</CardDescription>
                        </div>
                      </div>
                      <AccountActionsDropdown account={account} />
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="text-sm text-muted-foreground">
                            Saldo atual
                          </p>
                          <p className="text-sm font-semibold tracking-tight">
                            {moneyFormatter(account.currentBankBalance)}
                          </p>
                        </div>

                        {dayjs(currentSelectedDate).isAfter(
                          dayjs().startOf('month'),
                        ) ||
                        dayjs(currentSelectedDate).isSame(
                          dayjs().startOf('month'),
                        ) ? (
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-muted-foreground">
                              Saldo previsto do mês de{' '}
                              {dayjs(currentSelectedDate).format('MMMM')}
                            </p>
                            <p className="text-sm font-semibold tracking-tight">
                              {moneyFormatter(
                                account.expectedBankBalanceAtTheEndOftheMonth,
                              )}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-muted-foreground">
                              Saldo final do mês de{' '}
                              {dayjs(currentSelectedDate).format('MMMM')}
                            </p>
                            <p className="text-sm font-semibold tracking-tight">
                              {moneyFormatter(
                                account.bankBalanceAtTheEndOfTheMonth,
                              )}
                            </p>
                          </div>
                        )}
                        <div className="flex items-start justify-between">
                          <p className="text-sm text-muted-foreground">
                            Entradas do mês:
                          </p>
                          <p className="text-sm font-semibold tracking-tight">
                            {moneyFormatter(account.expectedRevenuesValue)}
                          </p>
                        </div>

                        <div className="flex items-start justify-between">
                          <p className="text-sm text-muted-foreground">
                            Saídas do mês:
                          </p>
                          <p className="text-sm font-semibold tracking-tight">
                            {moneyFormatter(
                              account.expectedExpensesValue < 0
                                ? account.expectedExpensesValue * -1
                                : account.expectedExpensesValue,
                            )}
                          </p>
                        </div>
                        {account.visibledInOverallBalance === false && (
                          <div className="mt-1 flex items-center gap-1">
                            <TriangleAlert className="size-3 shrink-0 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Conta não incluída para os cálculos da página
                              inicial.
                            </span>
                          </div>
                        )}
                        {account.blockedByExpiredSubscription === true && (
                          <div className="mt-1 flex items-center gap-1">
                            <XCircle className="size-4 shrink-0 text-muted-foreground" />
                            <span className="max-w-xs text-xs font-medium text-muted-foreground">
                              Conta bloqueada temporariamente deviado o não
                              pagamento da assinatura.
                            </span>
                          </div>
                        )}
                      </div>
                      {/* <Separator className="my-2" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold tracking-tight">
                      Conta criado no dia{' '}
                    </span>
                    <span className="text-xs font-semibold tracking-tight text-muted-foreground">
                      {dayjs(account.createdAt).format(
                        'DD [de] MMMM, YYYY [às] HH:mm',
                      )}
                    </span>
                  </div> */}
                    </CardContent>
                    <Separator className="" />
                    <CardFooter className="flex justify-end pt-6">
                      <Button
                        type="button"
                        onClick={() =>
                          handleChangeNewTransactionSheet(true, 'despesa')
                        }
                        variant="secondary"
                        className="w-full"
                      >
                        Adicionar despesa
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })
            )}
          </div>
        </div>
        <div className="sticky top-0 flex h-fit min-w-[500px] flex-col gap-4">
          <Card className={cn('flex-1', isLoadingBalance && 'opacity-50')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo atual</CardTitle>
              <HandCoins className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold tracking-tight">R$</span>
                  <Skeleton className="h-7 w-[120px]" />
                </div>
              ) : (
                <div className="text-2xl font-bold tracking-tight">
                  {moneyFormatter(balanceData?.currentBankingBalance ?? 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Saldo previsto do dia
              </p>
              {isLoadingBalance ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold tracking-tight">
                    R$
                  </span>
                  <Skeleton className="h-4 w-[70px]" />
                </div>
              ) : (
                <p className="text-xs font-semibold tracking-tight">
                  {moneyFormatter(
                    balanceData?.expectedBankingBalanceForToday ?? 0,
                  )}
                </p>
              )}
            </CardContent>
          </Card>
          <Card
            className={cn('group flex-1', isLoadingBalance && 'opacity-50')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="size-4 text-muted-foreground group-hover:hidden" />
              <button className="hidden transition-all duration-300 hover:scale-125 group-hover:inline-flex">
                <Maximize2 className="size-4 text-muted-foreground" />
              </button>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold tracking-tight">R$</span>
                  <Skeleton className="h-7 w-[120px]" />
                </div>
              ) : (
                <div className="text-2xl font-bold tracking-tight">
                  {moneyFormatter(balanceData?.expectedExpenseOfTheMonth ?? 0)}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {balanceData?.percentageOfExpenseComparedToLastMonth ? (
                  <>
                    {balanceData?.percentageOfExpenseComparedToLastMonth >
                      0 && (
                      <>
                        Você gastou{' '}
                        <span className="text-destructive">
                          {balanceData.percentageOfExpenseComparedToLastMonth}%
                        </span>{' '}
                        a mais do que no mês anterior.
                      </>
                    )}
                    {balanceData?.percentageOfExpenseComparedToLastMonth <
                      0 && (
                      <>
                        Você gastou{' '}
                        <span className="text-green-600">
                          {balanceData.percentageOfExpenseComparedToLastMonth *
                            -1}
                          %
                        </span>{' '}
                        a menos do que no mês anterior.
                      </>
                    )}
                  </>
                ) : (
                  <span>Nenhum dado do mês anterior para comparar.</span>
                )}
              </p>
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-muted-foreground">
                      Despesas pagas
                    </p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="size-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Leva em consideração apenas as despesas pagas desse
                            mês.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {isLoadingBalance ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold tracking-tight">
                        R$
                      </span>
                      <Skeleton className="h-4 w-[70px]" />
                    </div>
                  ) : (
                    <p className="text-xs font-semibold tracking-tight">
                      {moneyFormatter(balanceData?.paidExpenseOfTheMonth ?? 0)}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-muted-foreground">
                      Despesas a pagar
                    </p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="size-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Leva em consideração apenas as despesas não pagas
                            desse mês.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {isLoadingBalance ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold tracking-tight">
                        R$
                      </span>
                      <Skeleton className="h-4 w-[70px]" />
                    </div>
                  ) : (
                    <p className="text-xs font-semibold tracking-tight">
                      {moneyFormatter(
                        balanceData?.unpaidExpenseOfTheMonth ?? 0,
                      )}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn('group flex-1', isLoadingBalance && 'opacity-50')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita</CardTitle>
              <TrendingUp className="size-4 text-muted-foreground group-hover:hidden" />
              <button className="hidden transition-all duration-300 hover:scale-125 group-hover:inline-flex">
                <Maximize2 className="size-4 text-muted-foreground" />
              </button>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold tracking-tight">R$</span>
                  <Skeleton className="h-7 w-[120px]" />
                </div>
              ) : (
                <div className="text-2xl font-bold tracking-tight">
                  {moneyFormatter(balanceData?.expectedRevenueOfTheMonth ?? 0)}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {balanceData?.percentageOfRevenueComparedToLastMonth ? (
                  <>
                    {balanceData?.percentageOfRevenueComparedToLastMonth >
                      0 && (
                      <>
                        <span className="text-green-600">
                          +{balanceData.percentageOfRevenueComparedToLastMonth}%
                        </span>{' '}
                        do que no mês anterior.
                      </>
                    )}
                    {balanceData?.percentageOfRevenueComparedToLastMonth <
                      0 && (
                      <>
                        <span className="text-destructive">
                          {balanceData.percentageOfRevenueComparedToLastMonth}%
                        </span>{' '}
                        do que no mês anterior.
                      </>
                    )}
                  </>
                ) : (
                  <span>Nenhum dado do mês anterior para comparar.</span>
                )}
              </p>
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">
                  Receita mensal efetivada
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="size-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Leva em consideração apenas as receitas efetivadas.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {isLoadingBalance ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold tracking-tight">
                    R$
                  </span>
                  <Skeleton className="h-4 w-[70px]" />
                </div>
              ) : (
                <p className="text-xs font-semibold tracking-tight">
                  {moneyFormatter(balanceData?.realRevenueOfTheMonth ?? 0)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <CreateOrUpdateFinancialAccountModal
        open={showFinancialAccountModal}
        handleOpenChangeModal={setShowFinancialAccountModal}
      />
    </PageContentContainer>
  )
}

/// //// --------------------------
