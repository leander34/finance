'use client'
import { dayjs, fakeDelay, moneyFormatter } from '@saas/core'
import { useQuery } from '@tanstack/react-query'
import {
  Coins,
  CreditCard,
  HandCoins,
  HelpCircle,
  Maximize2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useParams } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getOverviewDataHttp } from '@/http/balance/get-overview-data'
import { cn } from '@/lib/utils'

interface OverviewDataProps {
  currentSelectedDate: string
}

export function OverviewData({ currentSelectedDate }: OverviewDataProps) {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  const { data, isLoading } = useQuery({
    queryKey: [
      'primary',
      'overview',
      currentOrg,
      dayjs(currentSelectedDate).startOf('month').format('YYYY-MM-DD'),
      true,
    ],
    queryFn: async () => {
      // await fakeDelay(5000)
      return getOverviewDataHttp({
        slug: currentOrg,
        month: dayjs(currentSelectedDate).startOf('month').month() + 1,
        year: dayjs(currentSelectedDate).year(),
        visibledInOverallBalance: true,
      })
    },
  })

  return (
    <div className="flex gap-4">
      {/* {JSON.stringify(data, null, 2)} */}
      <Card
        className={cn(
          'flex-1 border-none bg-transparent shadow-none',
          isLoading && 'opacity-50',
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo atual</CardTitle>
          <HandCoins className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold tracking-tight">R$</span>
              <Skeleton className="h-7 w-[120px]" />
            </div>
          ) : (
            <div className="text-2xl font-bold tracking-tight">
              {moneyFormatter(data?.currentBankingBalance ?? 0)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Saldo previsto do dia</p>
          {isLoading ? (
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold tracking-tight">R$</span>
              <Skeleton className="h-4 w-[70px]" />
            </div>
          ) : (
            <p className="text-xs font-semibold tracking-tight">
              {moneyFormatter(data?.expectedBankingBalanceForToday ?? 0)}
            </p>
          )}
        </CardContent>
      </Card>
      <Separator orientation="vertical" className="my-auto h-24" />
      <Card
        className={cn(
          'flex-1 border-none bg-transparent shadow-none',
          isLoading && 'opacity-50',
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balanço mensal</CardTitle>
          <Coins className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold tracking-tight">R$</span>
              <Skeleton className="h-7 w-[120px]" />
            </div>
          ) : (
            <div className="text-2xl font-bold tracking-tight">
              {moneyFormatter(data?.expectedMonthlyBalance ?? 0)}
            </div>
          )}
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">Balanço mensal real</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="size-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Leva em consideração apenas as receitas e despesas
                    efetivadas.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {isLoading ? (
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold tracking-tight">R$</span>
              <Skeleton className="h-4 w-[70px]" />
            </div>
          ) : (
            <p className="text-xs font-semibold tracking-tight">
              {moneyFormatter(data?.realMonthlyBalance ?? 0)}
            </p>
          )}
        </CardContent>
      </Card>
      <Separator orientation="vertical" className="my-auto h-24" />
      <Card
        className={cn(
          'group flex-1 border-none bg-transparent shadow-none',
          isLoading && 'opacity-50',
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita</CardTitle>
          <TrendingUp className="size-4 text-muted-foreground group-hover:hidden" />
          <button className="hidden transition-all duration-300 hover:scale-125 group-hover:inline-flex">
            <Maximize2 className="size-4 text-muted-foreground" />
          </button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold tracking-tight">R$</span>
              <Skeleton className="h-7 w-[120px]" />
            </div>
          ) : (
            <div className="text-2xl font-bold tracking-tight">
              {moneyFormatter(data?.expectedRevenueOfTheMonth ?? 0)}
            </div>
          )}

          {/* <p className="text-xs text-muted-foreground">
            {data?.percentageOfRevenueComparedToLastMonth ? (
              <>
                {data?.percentageOfRevenueComparedToLastMonth > 0 && (
                  <>
                    <span className="text-green-600">
                      +{data.percentageOfRevenueComparedToLastMonth}%
                    </span>{' '}
                    do que no mês anterior.
                  </>
                )}
                {data?.percentageOfRevenueComparedToLastMonth < 0 && (
                  <>
                    <span className="text-destructive">
                      {data.percentageOfRevenueComparedToLastMonth}%
                    </span>{' '}
                    do que no mês anterior.
                  </>
                )}
              </>
            ) : (
              <span>Nenhum dado do mês anterior para comparar.</span>
            )}
          </p> */}
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
          {isLoading ? (
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold tracking-tight">R$</span>
              <Skeleton className="h-4 w-[70px]" />
            </div>
          ) : (
            <p className="text-xs font-semibold tracking-tight">
              {moneyFormatter(data?.realRevenueOfTheMonth ?? 0)}
            </p>
          )}
        </CardContent>
      </Card>
      <Separator orientation="vertical" className="my-auto h-24" />
      <Card
        className={cn(
          'group flex-1 border-none bg-transparent shadow-none',
          isLoading && 'opacity-50',
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <TrendingDown className="size-4 text-muted-foreground group-hover:hidden" />
          <button className="hidden transition-all duration-300 hover:scale-125 group-hover:inline-flex">
            <Maximize2 className="size-4 text-muted-foreground" />
          </button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold tracking-tight">R$</span>
              <Skeleton className="h-7 w-[120px]" />
            </div>
          ) : (
            <div className="text-2xl font-bold tracking-tight">
              {moneyFormatter(data?.expectedExpenseOfTheMonth ?? 0)}
            </div>
          )}

          {/* <p className="text-xs text-muted-foreground">
            {data?.percentageOfExpenseComparedToLastMonth ? (
              <>
                {data?.percentageOfExpenseComparedToLastMonth > 0 && (
                  <>
                    Você gastou{' '}
                    <span className="text-destructive">
                      {data.percentageOfExpenseComparedToLastMonth}%
                    </span>{' '}
                    a mais do que no mês anterior.
                  </>
                )}
                {data?.percentageOfExpenseComparedToLastMonth < 0 && (
                  <>
                    Você gastou{' '}
                    <span className="text-green-600">
                      {data.percentageOfExpenseComparedToLastMonth * -1}%
                    </span>{' '}
                    a menos do que no mês anterior.
                  </>
                )}
              </>
            ) : (
              <span>Nenhum dado do mês anterior para comparar.</span>
            )}
          </p> */}
          <div className="flex justify-between">
            <div>
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">Despesas pagas</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="size-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Leva em consideração apenas as despesas pagas desse mês.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {isLoading ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold tracking-tight">
                    R$
                  </span>
                  <Skeleton className="h-4 w-[70px]" />
                </div>
              ) : (
                <p className="text-xs font-semibold tracking-tight">
                  {moneyFormatter(data?.paidExpenseOfTheMonth ?? 0)}
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
                        Leva em consideração apenas as despesas não pagas desse
                        mês.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {isLoading ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold tracking-tight">
                    R$
                  </span>
                  <Skeleton className="h-4 w-[70px]" />
                </div>
              ) : (
                <p className="text-xs font-semibold tracking-tight">
                  {moneyFormatter(data?.unpaidExpenseOfTheMonth ?? 0)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Separator orientation="vertical" className="my-auto h-24" />
      <Card
        className={cn(
          'flex-1 border-none bg-transparent shadow-none',
          isLoading && 'opacity-50',
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Fatura cartão de crédito
          </CardTitle>
          <CreditCard className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {moneyFormatter(data?.selectedInvoiceAmount ?? 0)}
          </div>
          {/* <p className="text-xs text-muted-foreground">
            Gastos do mês no cartão de crédito
          </p> */}
          <p className="text-xs text-muted-foreground">Valor pago da fatura</p>
          <p className="text-xs font-semibold tracking-tight">
            {moneyFormatter(data?.selectedInvoiceAmountPaid ?? 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
