'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { dayjs, moneyFormatter } from '@saas/core'
import { useQuery } from '@tanstack/react-query'
import { HTTPError } from 'ky'
import {
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  FileText,
  HandCoins,
  Landmark,
  Loader2,
  Plus,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { toast } from 'sonner'
import { z } from 'zod'

import { CustomInputNumber } from '@/components/global/custom-input-number'
import { useNewTransaction } from '@/components/new-transaction/hook'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Icons } from '@/components/ui/icons'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  fetchTransactionsHttp,
  type FetchTransactionsHttpResponse,
} from '@/http/transactions/fetch-transactions-http'
import { markATransactionAsPaidHttp } from '@/http/transactions/mark-a-transaction-as-paid-http'
import { queryClient } from '@/lib/react-query'
import { cn } from '@/lib/utils'
import { iconMapper } from '@/utlis/icon-mapper'
export function ExpensesOfTheMonth() {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  const { handleChangeNewTransactionSheet } = useNewTransaction()
  const [currentPage, setCurrentPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['primary', 'monthly-expenses-transactions', currentPage],
    queryFn: async () => {
      // await fakeDelay(3000)
      return fetchTransactionsHttp({
        slug: currentOrg,
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
        type: null,
        page: currentPage,
        visibledInOverallBalance: true,
      })
    },
    enabled: !!currentOrg,
  })

  const totalAmountOfExpenses = useMemo(() => {
    if (!data?.transactions) return 0
    const total = data?.transactions.reduce((sum, item) => {
      // if (item.type === 'TRANSFER') return sum
      return sum + item.amount
    }, 0)
    return total
  }, [data?.transactions])
  return (
    <Card className={cn('col-span-4 flex flex-col', isLoading && 'opacity-50')}>
      {/* {JSON.stringify(data, null, 2)} */}
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Movimentações do mês</CardTitle>
          {isLoading ? (
            <Skeleton className="h-4 w-[200px]" />
          ) : (
            <CardDescription>
              {data?.amountOfTransactions ?? 0}{' '}
              {data?.amountOfTransactions && data.amountOfTransactions > 1
                ? 'movimentações'
                : 'movimentação'}{' '}
              feita(s) neste mês.
            </CardDescription>
          )}
        </div>
        <Button className="" variant="outline-hover-primary" size="sm">
          Ver todas despesas
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="flex h-[360px] items-center justify-center rounded-xl border bg-primary-foreground shadow-sm">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.transactions || data?.transactions?.length === 0 ? (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <FileText
              className="size-9 text-muted-foreground"
              strokeWidth={1.4}
            />
            <div className="mt-1 flex flex-col items-center gap-1.5">
              <span className="text-base font-medium leading-none tracking-tight">
                Nenhuma despesa este mês
              </span>
              <span className="text-sm leading-none tracking-tight text-muted-foreground">
                Cadastre uma despesa agora.
              </span>
            </div>
            <Button
              onClick={() => handleChangeNewTransactionSheet(true, 'despesa')}
              size="sm"
              className="mt-2"
            >
              <Plus className="mr-1.5 size-4" />
              Nova despesa
            </Button>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-between">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                  <TableHead className="w-[200px]">Conta/Cartão</TableHead>
                  <TableHead className="w-[220px]">Despesa</TableHead>
                  <TableHead className="w-[220px]">Data Compra</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[150px]">Tipo</TableHead>
                  <TableHead className="w-[120px] text-left">Valor</TableHead>
                  <TableHead className="text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.transactions.map((transaction) => {
                  return (
                    <TransactionRow
                      transaction={transaction}
                      key={`${transaction.id}-${transaction.financialAccountId ?? transaction.creditCardId}`}
                    />
                  )
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={8}>Total</TableCell>
                  <TableCell className="">
                    {moneyFormatter(totalAmountOfExpenses)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <div className="mt-3 flex items-center justify-end space-x-6 lg:space-x-6">
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Página 1 de {data?.amountOfPages ?? 1}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === data?.amountOfPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => setCurrentPage(data?.amountOfPages ?? 1)}
                  disabled={currentPage === data?.amountOfPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface TransactionRowProps {
  transaction: FetchTransactionsHttpResponse['transactions'][0]
}
const markATransactionAsPaidFormSchema = z.object({
  amount: z
    .number({
      invalid_type_error: 'Valor inválido.',
      required_error: 'Valor inválido.',
    })
    .positive({ message: 'Valor deve ser maior do que zero.' }),
  realizationDate: z.date({
    required_error: 'Por favor, selecione uma data.',
  }),
})

type MarkATransactionAsPaidFormData = z.infer<
  typeof markATransactionAsPaidFormSchema
>
function TransactionRow({ transaction }: TransactionRowProps) {
  // const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  // const { currentOrg } = useCookies()
  const form = useForm<MarkATransactionAsPaidFormData>({
    resolver: zodResolver(markATransactionAsPaidFormSchema),
    defaultValues: {
      amount: transaction.amount * -1,
      realizationDate: dayjs().toDate(),
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = form

  const onSubmit: SubmitHandler<MarkATransactionAsPaidFormData> = async (
    inputs,
  ) => {
    // await fakeDelay(3000)
    const body = {
      slug: currentOrg,
      amount: inputs.amount * -1,
      transactionId: transaction.id,
      realizationDate: dayjs(inputs.realizationDate).format('YYYY-MM-DD'),
    }

    try {
      // await createTransactionHttp(body)
      console.log(body)
      await markATransactionAsPaidHttp(body)
      // form.reset({
      //   amount: 0,
      //   realizationDate: dayjs().toDate(),
      // })
      queryClient.invalidateQueries({
        queryKey: ['primary'],
        exact: false,
      })

      toast.success('Despesa marcada como paga!')
      setOpen(false)
    } catch (error) {
      console.log(error)
      if (error instanceof HTTPError) {
        const { message } = await error.response.json()
        toast.error(message, {
          position: 'top-center',
        })
      }
    }
  }

  // function handleMarkATransactionAsPaid() {
  //   startTransition(async () => {
  //     // let result: {
  //     //   success: boolean
  //     //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     //   message: any
  //     //   errors: null
  //     // } | null = null
  //     // if (transaction.status === 'PAID') {
  //     //   result = await markATransactionAsUnpaidAction(transaction.id)
  //     // }

  //     // if (transaction.status === 'UNPAID') {
  //     //   result = await markATransactionAsPaidAction(transaction.id)
  //     // }

  //     const result = await markATransactionAsPaidAction({
  //       transactionId: transaction.id,
  //       realizationDate: '',
  //       amount: 100,
  //     })

  //     if (result && result.success) {
  //       queryClient.invalidateQueries({
  //         queryKey: ['monthly-expenses-transactions'],
  //       })
  //       queryClient.invalidateQueries({
  //         queryKey: ['overview'],
  //       })
  //       toast.success(result.message)
  //     }

  //     if (result && result.success === false) {
  //       toast.error(result.message)
  //     }
  //   })
  // }

  function renderAccountOrCreditCard() {
    if (transaction.financialAccount) {
      return (
        <div className="flex items-center gap-2">
          {transaction.financialAccount.imageUrl && (
            <img
              src={transaction.financialAccount.imageUrl}
              alt="Icon do banco"
              className="size-7 rounded-full"
            />
          )}
          {transaction.financialAccount.name}
        </div>
      )
    }

    if (transaction.creditCard) {
      return (
        <div className="flex items-center gap-2">
          {transaction.creditCard.imageUrl && (
            <img
              src={transaction.creditCard.imageUrl}
              alt="Icon do banco"
              className="size-7 rounded-full"
            />
          )}
          {transaction.creditCard.name}
        </div>
      )
    }
  }

  function renderIcon() {
    if (transaction.financialAccount) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0} disableHoverableContent>
            <TooltipTrigger>
              <Landmark
                className="size-4 shrink-0 text-muted-foreground"
                strokeWidth={1.6}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Despesa criada em uma conta.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    if (transaction.creditCard) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0} disableHoverableContent>
            <TooltipTrigger>
              <CreditCard
                className="size-4 shrink-0 text-muted-foreground"
                strokeWidth={1.6}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Despesa criada em uma cartão de crédito.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  }

  function renderTransactionTypeIcon() {
    if (
      transaction.type === 'REVENUE' ||
      transaction.type === 'POSITIVE_ADJUSTMENT'
    ) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0} disableHoverableContent>
            <TooltipTrigger className="flex items-center justify-center rounded-full bg-green-600 p-1">
              <ArrowUp className="size-4 shrink-0 text-white" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Entrada</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    if (
      transaction.type === 'EXPENSE' ||
      transaction.type === 'NEGATIVE_ADJUSTMENT'
    ) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0} disableHoverableContent>
            <TooltipTrigger className="flex items-center justify-center rounded-full bg-red-600 p-1">
              <ArrowDown className="size-4 shrink-0 text-white" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Saída</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    if (transaction.type === 'TRANSFER') {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0} disableHoverableContent>
            <TooltipTrigger className="flex items-center justify-center rounded-full bg-sky-600 p-1">
              <ArrowRightLeft className="size-4 shrink-0 text-white" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Transferência de saldo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  }

  function renderCategoryIcon() {
    if (transaction.category && transaction.type !== 'TRANSFER') {
      const icon = transaction.category.icon as keyof typeof iconMapper
      const Icon = iconMapper[icon]
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0} disableHoverableContent>
            <TooltipTrigger className="inline-flex items-center rounded-full border border-transparent bg-secondary p-1 text-xs font-semibold text-primary transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{transaction.category.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    if (transaction.type === 'TRANSFER') {
      const Icon = iconMapper.Shuffle
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0} disableHoverableContent>
            <TooltipTrigger className="inline-flex items-center rounded-full border border-transparent bg-secondary p-1 text-xs font-semibold text-primary transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {transaction.amount < 0
                  ? 'Transferência de saída'
                  : 'Transferência de entrada'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  }

  function handleCloseModal(open: boolean) {
    form.reset({
      amount: transaction.amount * -1,
      realizationDate: dayjs().toDate(),
    })
    setOpen(open)
  }

  let statusVariant: 'unpaid' | 'paid' | 'pastDueDate' =
    transaction.calculatedTransactionStatus === 'OPEN' ? 'unpaid' : 'unpaid'
  statusVariant =
    transaction.calculatedTransactionStatus === 'PAID' ? 'paid' : statusVariant
  statusVariant =
    transaction.calculatedTransactionStatus === 'PAST_DUE_DATE'
      ? 'pastDueDate'
      : statusVariant

  return (
    <TableRow>
      <TableCell className="">{renderTransactionTypeIcon()}</TableCell>
      <TableCell className="">{renderCategoryIcon()}</TableCell>
      <TableCell className="">{renderIcon()}</TableCell>
      <TableCell className="font-medium">
        {renderAccountOrCreditCard()}
      </TableCell>
      <TableCell className="">{transaction.description}</TableCell>
      <TableCell>
        <div className="flex flex-col items-start gap-1">
          {dayjs(transaction.realizationDate).format('DD/MM/YYYY')}
          {transaction.creditCardInvoice && (
            <Badge variant="secondary">
              Fatura de{' '}
              {dayjs()
                .set('year', transaction.creditCardInvoice.year)
                .set('month', transaction.creditCardInvoice.month - 1)
                .format('MMMM')}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={statusVariant}>
          {transaction.calculatedTransactionStatus === 'OPEN' && 'Em aberto'}
          {transaction.calculatedTransactionStatus === 'PAID' && 'Pago'}
          {transaction.calculatedTransactionStatus === 'PAST_DUE_DATE' &&
            'Vencido'}
        </Badge>
      </TableCell>
      <TableCell>
        {/* <Badge variant="plan">Única</Badge> */}
        <Badge variant="plan">{transaction.transactionPaymentType}</Badge>

        {/* <Badge variant="plan">Única</Badge> */}
        {/* <Badge variant="plan">Parcela 4 de 10</Badge> */}
      </TableCell>
      <TableCell className="text-left">
        {moneyFormatter(
          transaction.type === 'EXPENSE' ||
            transaction.type === 'NEGATIVE_ADJUSTMENT'
            ? transaction.amount
            : transaction.amount,
        )}
      </TableCell>
      <TableCell className="text-center">
        {transaction.status === 'UNPAID' &&
          transaction.creditCardId === null && (
            <TooltipProvider>
              <Tooltip delayDuration={0} disableHoverableContent>
                <TooltipTrigger
                  type="button"
                  onClick={() => setOpen(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      {/* {transaction.status === 'PAID' && (
                      <CheckCheck className="size-4 shrink-0" />
                    )} */}

                      {transaction.status === 'UNPAID' && (
                        <HandCoins className="size-4 shrink-0" />
                      )}
                    </>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {/* {transaction.status === 'PAID' && (
                  <p>Essa despesa já foi paga.</p>
                )} */}

                  {transaction.status === 'UNPAID' && (
                    <p>Marcar despesa como paga</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

        <Dialog open={open} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Deseja efetivar esta despesa?</DialogTitle>
              <DialogDescription>
                Ao efetivar essa despesa será descontado o valor na Conta.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={control}
                  name="amount"
                  disabled={isSubmitting}
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col space-y-1">
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <NumericFormat
                          name={field.name}
                          onBlur={field.onBlur}
                          getInputRef={field.ref}
                          value={field.value}
                          disabled={field.disabled}
                          allowNegative={false}
                          // isAllowed={(values) => {
                          //   const { floatValue } = values
                          //   return floatValue ? floatValue < 0 : true
                          // }}
                          allowLeadingZeros={false}
                          customInput={CustomInputNumber}
                          decimalScale={2}
                          fixedDecimalScale
                          thousandSeparator="."
                          decimalSeparator=","
                          thousandsGroupStyle="thousand"
                          placeholder="0,00"
                          className="w-full"
                          onValueChange={(values) => {
                            const { floatValue } = values
                            field.onChange(floatValue ?? '')
                            // setValue('amount', floatValue)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="realizationDate"
                  disabled={isSubmitting}
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col space-y-1">
                      <FormLabel>Data do pagamento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant={'outline'}
                              disabled={isSubmitting}
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                                isSubmitting && 'cursor-not-allowed opacity-50',
                              )}
                            >
                              {field.value ? (
                                <>
                                  {dayjs(field.value).format(
                                    'DD [de] MMM[,] YYYY',
                                  )}
                                </>
                              ) : (
                                <span>Selecione um data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto space-y-2 p-2"
                          align="start"
                        >
                          <span className="text-sm tracking-tight text-muted-foreground">
                            Selecione uma data
                          </span>
                          <div className="flex items-center justify-between">
                            <Button
                              disabled={isSubmitting}
                              type="button"
                              variant="secondary"
                              onClick={() => {
                                setValue(
                                  'realizationDate',
                                  dayjs().subtract(1, 'day').toDate(),
                                )
                              }}
                            >
                              Ontem
                            </Button>
                            <Button
                              disabled={isSubmitting}
                              type="button"
                              variant="secondary"
                              onClick={() => {
                                setValue('realizationDate', dayjs().toDate())
                              }}
                            >
                              Hoje
                            </Button>
                            <Button
                              disabled={isSubmitting}
                              type="button"
                              variant="secondary"
                              onClick={() => {
                                setValue(
                                  'realizationDate',
                                  dayjs().add(1, 'day').toDate(),
                                )
                              }}
                            >
                              Amanhã
                            </Button>
                          </div>
                          <div className="rounded-md border">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date('1900-01-01') || isSubmitting
                              }
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                      <FormDescription className="">
                        Data em que a despesa foi ou será paga.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <DialogFooter className="flex w-full sm:justify-between">
                  <DialogClose disabled={isSubmitting}>Cancelar</DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                    )}
                    Pagar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  )
}
