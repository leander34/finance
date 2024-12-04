'use client'

import { dayjs, moneyFormatter } from '@saas/core'
import { useQuery } from '@tanstack/react-query'
import {
  CirclePlus,
  CreditCard,
  DollarSign,
  Loader2,
  Receipt,
} from 'lucide-react'
import Image from 'next/image'
import { useParams, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { CreateOrUpdateCreditCardModal } from '@/components/global/create-or-update-credit-card-modal'
import { PageContentContainer } from '@/components/global/page-content-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  fetchCreditCardsWithDetailsHttp,
  type FetchCreditCardsWithDetailsHttpResponse,
} from '@/http/credit-cards/fetch-credit-cards-with-details-http'
import { getCreditCardsOverviewHttp } from '@/http/credit-cards/get-credit-cards-overview'
import { cn } from '@/lib/utils'

import { CreditCardActionsDropdown } from './_components/credit-card-actions-dropdown'

// import { columns } from './_components/_financial-accounts/columns'
// import { DataTable } from './_components/_financial-accounts/data-table'
// import { AccountActionsDropdown } from './_components/account-actions-dropdown'
export default function ContasFinanceirasPage() {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  // const { handleChangeNewTransactionSheet } = useNewTransaction()
  const [showCreditCardModal, setShowCreditCardModal] = useState(false)
  // const [currentPage, setCurrentPage] = useState(1)

  const searchParams = useSearchParams()
  const currentSelectedDate =
    searchParams.get('data-inicio') ??
    dayjs().startOf('month').format('YYYY-MM-DD')

  const { data, isLoading } = useQuery({
    queryKey: [
      'primary',
      'credit-cards',
      currentOrg,
      dayjs(currentSelectedDate).startOf('month').format('YYYY-MM-DD'),
    ],
    queryFn: async () => {
      // await fakeDelay(3000)
      return fetchCreditCardsWithDetailsHttp({
        slug: currentOrg,
        month: dayjs(currentSelectedDate).startOf('month').month() + 1,
        year: dayjs(currentSelectedDate).year(),
      })
    },
  })

  const { data: creditCardsOverviewData, isLoading: isLoadingBalance } =
    useQuery({
      queryKey: [
        'primary',
        'credit-cards-overview',
        currentOrg,
        dayjs(currentSelectedDate).startOf('month').format('YYYY-MM-DD'),
      ],
      queryFn: async () => {
        // await fakeDelay(5000)
        return getCreditCardsOverviewHttp({
          slug: currentOrg,
          month: dayjs(currentSelectedDate).startOf('month').month() + 1,
          year: dayjs(currentSelectedDate).year(),
        })
      },
    })

  console.log(creditCardsOverviewData)

  function getInvoiceStatusName(
    invoicee: FetchCreditCardsWithDetailsHttpResponse['creditCards'][0]['invoice'],
  ) {
    const invoice = invoicee
    if (!invoice) {
      return `Fatura de ${dayjs(currentSelectedDate).format('MMMM')} não foi criada.`
    }
    // invoice.status = 'CLOSED'

    // open
    if (invoice.status === 'OPEN') {
      return 'Fatura aberta'
    }

    // closed
    if (
      invoice.status === 'CLOSED' &&
      invoice.invoicePaymentStatus === 'FULLY_PAID'
    ) {
      return 'Fatura paga'
    }

    if (
      invoice.status === 'CLOSED' &&
      invoice.invoicePaymentStatus === 'PARTIALLY_PAID'
    ) {
      return 'Fatura fechada (Parcialmente paga)'
    }

    if (
      invoice.status === 'CLOSED' &&
      invoice.invoicePaymentStatus === 'UNPAID'
    ) {
      return 'Fatura fechada (Não paga)'
    }

    if (
      invoice.status === 'PAST_DUE_DATE' &&
      invoice.invoicePaymentStatus === 'FULLY_PAID'
    ) {
      return 'Fatura paga'
    }

    if (
      invoice.status === 'PAST_DUE_DATE' &&
      invoice.invoicePaymentStatus === 'PARTIALLY_PAID'
    ) {
      return 'Fatura vencida (Parcialmente paga)'
    }

    if (
      invoice.status === 'PAST_DUE_DATE' &&
      invoice.invoicePaymentStatus === 'UNPAID'
    ) {
      return 'Fatura vencida (Não paga)'
    }

    if (invoice.status === 'NOT_OPEN') {
      return 'Fatura parcial'
    }

    // venciada
  }

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
                onClick={() => setShowCreditCardModal(true)}
                variant="outline"
                className="flex h-full min-h-[300px] min-w-[400px] flex-col items-center justify-center gap-1"
              >
                <CirclePlus
                  className="size-10 text-muted-foreground group-hover:text-foreground"
                  strokeWidth={1.2}
                />
                <span className="text-sm leading-none tracking-tight text-muted-foreground">
                  Novo cartão de crédito
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
              data?.creditCards.map((creditCard) => {
                return (
                  <div
                    key={creditCard.id}
                    className="flex  min-h-[300px] min-w-[400px] flex-col rounded-xl border bg-card p-6 text-card-foreground shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image
                          alt={creditCard.financialAccount.bank.name}
                          src={creditCard.financialAccount.bank.imageUrl}
                          width={40}
                          height={40}
                          className="rounded-full text-white"
                        />
                        <span className="leading-none tracking-tight">
                          {creditCard.name}
                        </span>
                        {/* <Image
                          alt="a"
                          src="/chip.jpeg"
                          width={40}
                          height={40}
                          className="rounded-md"
                        />

                        <Image
                          alt="a"
                          src="/c.svg"
                          width={40}
                          height={40}
                          className="rounded-md text-white"
                        /> */}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* <span>master</span> */}
                        <CreditCardActionsDropdown creditCard={creditCard} />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col space-y-3 pt-3">
                      <div className="flex-1">
                        <span className="text-base leading-none tracking-tight text-muted-foreground">
                          {getInvoiceStatusName(creditCard.invoice)}
                        </span>
                      </div>
                      {creditCard.invoice && (
                        <div className="flex justify-between self-end">
                          <div className="flex flex-col gap-1">
                            <span className="self-end text-xl font-medium leading-none tracking-tight">
                              {moneyFormatter(
                                creditCard.invoice?.currentInvoiceValue ?? 0,
                              )}
                            </span>
                            {creditCard.invoice && (
                              <span className="self-end text-xs leading-none tracking-tight text-muted-foreground">
                                {creditCard.invoice.status === 'CLOSED' ||
                                creditCard.invoice.status === 'PAST_DUE_DATE'
                                  ? 'fechou'
                                  : 'fecha'}{' '}
                                {dayjs(creditCard.invoice.periodEnd).format(
                                  'DD/MM',
                                )}
                              </span>
                            )}
                            {creditCard.invoice && (
                              <span className="self-end text-xs leading-none tracking-tight text-muted-foreground">
                                {dayjs().isAfter(
                                  dayjs(creditCard.invoice.dueDate),
                                  'date',
                                ) &&
                                !dayjs().isSame(
                                  dayjs(creditCard.invoice.dueDate),
                                  'date',
                                )
                                  ? 'venceu'
                                  : 'vence'}{' '}
                                {dayjs(creditCard.invoice.dueDate).format(
                                  'DD/MM',
                                )}
                              </span>
                            )}
                            <span className="self-end text-xs font-medium leading-none tracking-tight text-muted-foreground">
                              Valor total da fatura:{' '}
                              {moneyFormatter(
                                creditCard.invoice?.totalInvoiceExpensesValue ??
                                  0,
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                      {creditCard.invoice &&
                        creditCard.invoice.amountOfPayments > 0 &&
                        creditCard.invoice.lastInvoicePaymentDate &&
                        creditCard.invoice.lastInvoicePaymentAmount && (
                          <div className="flex flex-1 flex-col space-y-0.5">
                            <span className="text-sm leading-none tracking-tight text-muted-foreground">
                              Último pagamento da fatura:
                            </span>
                            <div className="text-xs font-medium text-muted-foreground">
                              <span className="leading-none tracking-tight">
                                {dayjs(
                                  creditCard.invoice.lastInvoicePaymentDate,
                                ).format('DD [de] MMMM, YYYY')}
                              </span>{' '}
                              <span className="leading-none tracking-tight">
                                {moneyFormatter(
                                  creditCard.invoice.lastInvoicePaymentAmount,
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                    <Separator className="my-6" />

                    <div className="flex items-end justify-between">
                      <div className="flex justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs leading-none tracking-tight text-muted-foreground">
                            Limite total{' '}
                            <span className="font-medium text-foreground">
                              {moneyFormatter(creditCard.limit)}
                            </span>
                          </span>
                          {/* <span className="text-xs leading-none tracking-tight text-muted-foreground">
                            Limite disponível{' '}
                            <span className="font-medium text-foreground">
                              R$ 3.000,00
                            </span>
                          </span> */}
                        </div>
                      </div>
                      {/* <span className="text-xs leading-none tracking-tight text-muted-foreground">
                        Melhor dia de compra{' '}
                        <span className="font-medium text-foreground">
                          {creditCard.invoice
                            ? dayjs(creditCard.invoice.periodEnd)
                                .add(1, 'day')
                                .format('DD/MM')
                            : 'o'}
                        </span>
                      </span> */}
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs leading-none tracking-tight text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {moneyFormatter(creditCard.usedLimit)}
                          </span>{' '}
                          de{' '}
                          <span className="font-medium text-foreground">
                            {moneyFormatter(creditCard.limit)}
                          </span>
                        </span>
                        <span className="text-xs font-medium leading-none tracking-tight text-foreground">
                          {creditCard.usedLimitInPercentage.toFixed(2)}%
                        </span>
                      </div>
                      <div className="relative h-3.5 w-full overflow-hidden rounded-xl border shadow">
                        <span
                          className="absolute h-full rounded-br-xl rounded-tr-xl bg-primary"
                          style={{
                            backgroundColor: creditCard.color,
                            width: `${creditCard.usedLimitInPercentage}%`,
                          }}
                        ></span>
                      </div>
                      <span className="text-xs leading-none tracking-tight text-muted-foreground">
                        Limite Disponível{' '}
                        <span className="font-medium text-foreground">
                          {moneyFormatter(creditCard.availableLimit)}
                        </span>
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
        {/* Aside Cards */}
        <div className="sticky top-0 flex h-fit min-w-[500px] flex-col gap-4">
          {/* <Card className={cn('flex-1', isLoadingBalance && 'opacity-50')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                O melhor cartão para comprar hoje é
              </CardTitle>
              <HandCoins className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <div className="">
                  <Skeleton className="h-7 w-[140px]" />
                </div>
              ) : (
                <div className="text-2xl font-bold tracking-tight">
                  Cartão inter
                </div>
              )}
            </CardContent>
          </Card> */}
          <Card className={cn('flex-1', isLoadingBalance && 'opacity-50')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sua próxima fatura vence em
              </CardTitle>
              <Receipt className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <div className="">
                  <Skeleton className="h-7 w-[140px]" />
                </div>
              ) : (
                <div className="text-2xl font-bold tracking-tight">
                  {creditCardsOverviewData?.nextInvoiceDueDate
                    ? dayjs(creditCardsOverviewData?.nextInvoiceDueDate).format(
                        'DD [de] MMMM',
                      )
                    : 'Nenhuma fatura criada'}
                  {}
                </div>
              )}
            </CardContent>
          </Card>
          <Card
            className={cn('group flex-1', isLoadingBalance && 'opacity-50')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Limite disponível
              </CardTitle>
              <CreditCard className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold tracking-tight">R$</span>
                  <Skeleton className="h-7 w-[120px]" />
                </div>
              ) : (
                <div className="text-2xl font-bold tracking-tight">
                  {moneyFormatter(
                    creditCardsOverviewData?.totalCreditCardsAvailableLimit ??
                      0,
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <Card
            className={cn('group flex-1', isLoadingBalance && 'opacity-50')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor total faturas de{' '}
                {dayjs(currentSelectedDate).format('MMMM')}
              </CardTitle>
              <DollarSign className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold tracking-tight">R$</span>
                  <Skeleton className="h-7 w-[120px]" />
                </div>
              ) : (
                <div className="text-2xl font-bold tracking-tight">
                  {moneyFormatter(
                    creditCardsOverviewData
                      ?.summaryOfInvoicesForTheSelectedMonth
                      .totalInvoiceAmount ?? 0,
                  )}
                </div>
              )}
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">Valor pago</p>
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
                  {moneyFormatter(
                    creditCardsOverviewData
                      ?.summaryOfInvoicesForTheSelectedMonth
                      .invoicePaymentAmount ?? 0,
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <CreateOrUpdateCreditCardModal
        open={showCreditCardModal}
        handleOpenChangeModal={setShowCreditCardModal}
      />
    </PageContentContainer>
  )
}

/// //// --------------------------
