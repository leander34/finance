'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { CaretSortIcon } from '@radix-ui/react-icons'
import { dayjs, moneyFormatter } from '@saas/core'
import { useQuery } from '@tanstack/react-query'
import { CalendarIcon, CheckIcon, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { toast } from 'sonner'
import { z } from 'zod'

import { CustomInputNumber } from '@/components/global/custom-input-number'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
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
import { payCreditCardInvoiceHttp } from '@/http/credit-cards/pay-credit-card-invoice-http'
import { fetchFinancialAccountsHttp } from '@/http/financial-accounts/fetch-financial-accounts-http'
import { queryClient } from '@/lib/react-query'
import { cn } from '@/lib/utils'

const invoicePaymentFormSchema = z.object({
  amount: z
    .number({
      invalid_type_error: 'Valor inválido.',
      required_error: 'Valor inválido.',
    })
    .nonnegative({ message: 'Valor não pode ser negativo.' }),
  realizationDate: z.date({
    required_error: 'Por favor, selecione uma data.',
  }),
  financialAccountId: z
    .string({ required_error: 'Conta inválida.' })
    .uuid({ message: 'Conta inválida.' }),
})

type InvoicePaymentFormData = z.infer<typeof invoicePaymentFormSchema>

interface InvoicePaymentModalProps {
  open: boolean
  handleOpenChangeModal(open: boolean): void
  currentInvoiceValue: number
  invoiceId: string | null
  defaultFinancialAccountId: string
}

export function InvoicePaymentModal({
  open,
  handleOpenChangeModal,
  currentInvoiceValue,
  invoiceId,
  defaultFinancialAccountId,
}: InvoicePaymentModalProps) {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  const form = useForm<InvoicePaymentFormData>({
    resolver: zodResolver(invoicePaymentFormSchema),
    defaultValues: {
      financialAccountId: defaultFinancialAccountId,
      realizationDate: dayjs().toDate(),
    },
  })
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    setError,
    setValue,
    watch,
  } = form

  //   useEffect(() => {
  //     setTimeout(() => {
  //       if (defaultFinancialAccountId && !watch('financialAccountId')) {
  //         setValue('financialAccountId', defaultFinancialAccountId)
  //       }
  //     }, 100)
  //   }, [defaultFinancialAccountId, watch('financialAccountId')])

  const { data: financialAccountData, isLoading: isLoadingFinancialAccounts } =
    useQuery({
      queryKey: ['secondary', 'financial-accounts', currentOrg],
      queryFn: () => {
        return fetchFinancialAccountsHttp({
          slug: currentOrg,
          includeWallet: true,
        })
      },
      enabled: !!currentOrg,
    })
  // buscar valor da fatura

  //   const {} = useQuery({
  //     queryKey: [''],
  //     queryFn: get,
  //     enabled: open,
  //   })

  const handleSelectTotalAmountForInvoicePayment = () => {
    setValue('amount', currentInvoiceValue, { shouldValidate: true })
  }

  const onSubmit: SubmitHandler<InvoicePaymentFormData> = async (inputs) => {
    console.log(inputs)
    if (!invoiceId) {
      return toast.error('Essa fatura não existe!')
    }
    if (inputs.amount > currentInvoiceValue) {
      setError(
        'amount',
        {
          message:
            'O valor precisa ser menor ou igual ao valor disponível para pagamento da fatura atual.',
        },
        {
          shouldFocus: true,
        },
      )
      return
    }
    try {
      await payCreditCardInvoiceHttp({
        slug: currentOrg,
        invoiceId,
        amount: inputs.amount,
        financialAccountId: inputs.financialAccountId,
        realizationDate: dayjs(inputs.realizationDate).format('YYYY-MM-DD'),
      })
      toast.success('Fatura paga com sucesso!')
      await queryClient.invalidateQueries({
        queryKey: ['primary'],
        exact: false,
      })
      onCloseModal(false)
    } catch (error) {}
  }

  const selectedFinancialAccount = useMemo(() => {
    const financialAccount = watch('financialAccountId')
    if (!financialAccountData) return null
    if (!financialAccount) return null
    const account = financialAccountData.financialAccounts.find(
      (item) => item.id === financialAccount,
    )
    return account
  }, [financialAccountData, watch('financialAccountId')])

  const onCloseModal = (open: boolean) => {
    handleOpenChangeModal(open)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Pagar fatura</DialogTitle>
          <DialogDescription>
            Pague sua fatura totalmente ou parcialmente para maior controle de
            suas finanças.
          </DialogDescription>
        </DialogHeader>
        {currentInvoiceValue === 0 ? (
          <div className="flex flex-col items-center space-y-1 py-4">
            <span className=" leading-none tracking-tight ">
              Não é possível pagar essa fatura
            </span>
            <span className="text-sm leading-none tracking-tight text-muted-foreground">
              A fatura selecionada está zerada.
            </span>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col space-y-6"
            >
              <div className="flex items-start justify-between gap-10 rounded-md border p-4 shadow-sm">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm leading-none tracking-tight">
                    Valor da fatura selecionada{' '}
                    <span className="font-semibold">
                      {moneyFormatter(currentInvoiceValue)}
                    </span>
                  </span>
                  <span className="text-xs leading-none tracking-tight text-muted-foreground">
                    Pague sua fatura totalmente ou parcialmente para maior
                    controle de suas finanças.
                  </span>
                </div>
                <Button
                  onClick={handleSelectTotalAmountForInvoicePayment}
                  type="button"
                  font="xsm"
                  size="sm"
                >
                  Selecionar valor total
                </Button>
              </div>

              <div>
                <div className="flex items-start gap-4">
                  <div className="flex flex-1 flex-col gap-1">
                    <FormField
                      control={control}
                      name="amount"
                      disabled={isSubmitting}
                      render={({ field }) => (
                        <FormItem className="flex flex-1 flex-col space-y-1">
                          <FormLabel>Valor a ser pago da fatura</FormLabel>
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
                                field.onChange(floatValue || '')
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
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
                                    isSubmitting &&
                                      'cursor-not-allowed opacity-50',
                                  )}
                                >
                                  {field.value ? (
                                    dayjs(field.value).format(
                                      'DD [de] MMM[,] YYYY',
                                    )
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
                                    setValue(
                                      'realizationDate',
                                      dayjs().toDate(),
                                    )
                                  }}
                                >
                                  Hoje
                                </Button>
                              </div>
                              <div className="rounded-md border">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date('1900-01-01') ||
                                    isSubmitting ||
                                    date > new Date()
                                  }
                                />
                              </div>
                            </PopoverContent>
                          </Popover>

                          <FormMessage />
                          <FormDescription className="">
                            Data em que foi feito o pagamento da fatura.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={control}
                  name="financialAccountId"
                  disabled={isSubmitting || isLoadingFinancialAccounts}
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col">
                      <FormLabel>Conta de pagamento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              disabled={
                                isSubmitting || isLoadingFinancialAccounts
                              }
                              className={cn(
                                'max-h-9 min-h-9 flex-1 justify-between p-0 pl-3',
                                !field.value && 'text-muted-foreground',
                                (isSubmitting || isLoadingFinancialAccounts) &&
                                  'cursor-not-allowed opacity-50',
                              )}
                            >
                              {selectedFinancialAccount ? (
                                <div className="flex items-center justify-center">
                                  <Image
                                    src={selectedFinancialAccount.bank.imageUrl}
                                    alt={selectedFinancialAccount.name}
                                    className="mr-2 rounded-full"
                                    width={24}
                                    height={24}
                                  />
                                  <span className="inline-flex pr-4">
                                    {selectedFinancialAccount.name}
                                  </span>
                                </div>
                              ) : (
                                'Selecione uma conta de pagamento'
                              )}
                              <CaretSortIcon className="ml-2 mr-3 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Procure uma conta..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                Nenhuma conta encontrada.
                              </CommandEmpty>
                              <CommandGroup heading="Contas">
                                {financialAccountData?.financialAccounts &&
                                financialAccountData.financialAccounts.length >
                                  0 ? (
                                  financialAccountData?.financialAccounts.map(
                                    (item) => {
                                      return (
                                        <CommandItem
                                          key={item.id}
                                          disabled={
                                            isSubmitting ||
                                            isLoadingFinancialAccounts
                                          }
                                          className={cn(
                                            'cursor-pointer',
                                            (isSubmitting ||
                                              isLoadingFinancialAccounts) &&
                                              'cursor-not-allowed opacity-50',
                                          )}
                                          onSelect={() => {
                                            setValue(
                                              'financialAccountId',
                                              item.id,
                                              {
                                                shouldValidate: true,
                                              },
                                            )
                                          }}
                                        >
                                          <Image
                                            src={item.bank.imageUrl}
                                            alt={item.name}
                                            className="mr-2 size-6 rounded-full"
                                            width={24}
                                            height={24}
                                          />
                                          {item.name}
                                          <CheckIcon
                                            className={cn(
                                              'ml-auto h-4 w-4',
                                              item.id === field.value
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                            )}
                                          />
                                        </CommandItem>
                                      )
                                    },
                                  )
                                ) : (
                                  <CommandItem
                                    disabled
                                    className="cursor-not-allowed opacity-50"
                                  >
                                    Nenhuma conta cadastrada.
                                  </CommandItem>
                                )}
                              </CommandGroup>
                              {selectedFinancialAccount && (
                                <>
                                  <CommandSeparator />
                                  <CommandGroup>
                                    <CommandItem asChild>
                                      <Button
                                        type="button"
                                        className="w-full cursor-pointer"
                                        variant="secondary"
                                        onClick={() => {
                                          setValue('financialAccountId', '')
                                        }}
                                      >
                                        <Trash2 className="mr-1 size-4 shrink-0" />
                                        Remover
                                      </Button>
                                    </CommandItem>
                                  </CommandGroup>
                                </>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="flex gap-1">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                  )}
                  Pagar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
