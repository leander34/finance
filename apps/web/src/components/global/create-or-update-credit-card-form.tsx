'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { CaretSortIcon } from '@radix-ui/react-icons'
import { PopoverPortal } from '@radix-ui/react-popover'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { normalizeWords } from '@saas/core'
import { useQuery } from '@tanstack/react-query'
import { HTTPError } from 'ky'
import { Check, CheckIcon, Loader2, Palette } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { toast } from 'sonner'
import { z } from 'zod'

import { CustomInputNumber } from '@/components/global/custom-input-number'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { DialogClose } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createCreditCardHttp,
  type CreateCreditCardHttpRequest,
} from '@/http/credit-cards/create-credit-card-http'
import { updateCreditCardHttp } from '@/http/credit-cards/update-credit-card-http'
import { fetchFinancialAccountsHttp } from '@/http/financial-accounts/fetch-financial-accounts-http'
import { queryClient } from '@/lib/react-query'
import { cn } from '@/lib/utils'
import { creditCardFlags } from '@/utlis/credit-card-flags'

import { Icons } from '../ui/icons'
import { CreateOrUpdateFinancialAccountModal } from './create-or-update-financial-account-modal'

type Steps = 'CHOOSE_FINANCIAL_ACCOUNT' | 'CREDIT_CARD_DATA'

const creditCardFormSchema = z.object({
  name: z.string({
    required_error: 'Por favor, digite um nome para o cartão de crédito.',
  }),
  limit: z
    .number({
      invalid_type_error: 'Valor inválido.',
      required_error: 'Limite inválido.',
    })
    .nonnegative({ message: 'Limite não pode ser negativo.' }),
  invoiceClosingDate: z
    .number({
      invalid_type_error: 'Dia de fechamento inválido.',
      required_error: 'Dia de fechamento inválido.',
    })
    .min(1, { message: 'Dia de fechamente inválido.' })
    .max(31, { message: 'Dia de fechamente inválido.' })
    .nonnegative({ message: 'Dia de fechamento não pode ser negativo.' }),
  invoiceDueDate: z
    .number({
      invalid_type_error: 'Dia de vencimento inválido.',
      required_error: 'Dia de vencimento inválido.',
    })
    .min(1, { message: 'Dia de vencimento inválido.' })
    .max(31, { message: 'Dia de vencimento inválido.' })
    .nonnegative({ message: 'Dia de vencimento não pode ser negativo.' }),
  flag: z.union([
    z.literal('MCC'),
    z.literal('VCC'),
    z.literal('ECC'),
    z.literal('HCC'),
    z.literal('ACC'),
    z.literal('OUTROS'),
  ]),
  financialAccountId: z
    .string({
      required_error: 'Por favor, selecione uma instituição financeira.',
    })
    .uuid(),
  color: z.string({ required_error: 'Por favor, selecione uma cor.' }),
})

export type CreditCardFormData = z.infer<typeof creditCardFormSchema>

interface CreateCreditCardFormProps {
  handleCloseModal(newValue: boolean): void
  isUpdating?: boolean
  initialData?: {
    id: string
    name: string
    limit: number
    invoiceClosingDate: number
    invoiceDueDate: number
    flag: CreateCreditCardHttpRequest['flag']
    financialAccountId: string
    color: string
  }
}
export function CreateOrUpdateCreditCardForm({
  isUpdating = false,
  initialData,
  handleCloseModal,
}: CreateCreditCardFormProps) {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  const [showFinancialAccountModal, setShowFinancialAccountModal] =
    useState(false)
  const [step, setStep] = useState<Steps>(
    isUpdating ? 'CREDIT_CARD_DATA' : 'CHOOSE_FINANCIAL_ACCOUNT',
  )

  const form = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardFormSchema),
    defaultValues: {
      name: initialData?.name,
      limit: initialData?.limit,
      flag: initialData?.flag,
      invoiceClosingDate: initialData?.invoiceClosingDate,
      invoiceDueDate: initialData?.invoiceDueDate,
      financialAccountId: initialData?.financialAccountId,
      color: initialData?.color,
    },
  })
  const [inputFilter, setInputFilter] = useState('')
  const {
    watch,
    setValue,
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = form

  const { data, isLoading } = useQuery({
    queryKey: ['primary', 'financial-accounts', currentOrg],
    queryFn: async () => {
      // await fakeDelay(1000)
      return fetchFinancialAccountsHttp({
        slug: currentOrg,
        includeWallet: false,
      })
    },
  })

  useEffect(() => {
    setTimeout(() => {
      if (initialData?.financialAccountId && !watch('financialAccountId')) {
        setValue('financialAccountId', initialData.financialAccountId)
      }
    }, 100)
  }, [initialData?.financialAccountId, watch('financialAccountId')])

  function handleChoiceFinancialAccount(financialAccountId: string) {
    setValue('financialAccountId', financialAccountId)
    setStep('CREDIT_CARD_DATA')
  }

  const onSubmit: SubmitHandler<CreditCardFormData> = async (inputs) => {
    console.log({
      slug: currentOrg,
      name: inputs.name,
      limit: inputs.limit,
      flag: inputs.flag,
      invoiceClosingDate: inputs.invoiceClosingDate,
      invoiceDueDate: inputs.invoiceDueDate,
      financialAccountId: inputs.financialAccountId,
      color: inputs.color,
    })

    try {
      if (isUpdating) {
        if (!initialData) return
        await updateCreditCardHttp({
          slug: currentOrg,
          creditCardId: initialData.id,
          name: inputs.name,
          limit: inputs.limit,
          flag: inputs.flag,
          invoiceClosingDate: inputs.invoiceClosingDate,
          invoiceDueDate: inputs.invoiceDueDate,
          financialAccountId: inputs.financialAccountId,
          color: inputs.color,
        })
      } else {
        await createCreditCardHttp({
          slug: currentOrg,
          name: inputs.name,
          limit: inputs.limit,
          flag: inputs.flag,
          invoiceClosingDate: inputs.invoiceClosingDate,
          invoiceDueDate: inputs.invoiceDueDate,
          financialAccountId: inputs.financialAccountId,
          color: inputs.color,
        })
      }

      // await queryClient.invalidateQueries({
      //   queryKey: ['secondary', 'financial-accounts'],
      //   exact: false,
      // })

      await queryClient.invalidateQueries({
        queryKey: ['primary'],
        exact: false,
      })

      toast.success('Cartão salvo com sucesso!')
      handleCloseModal(false)
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

  const financialAccountsFiltred = useMemo(() => {
    if (!data) return []
    const newFinancialAccounts = data?.financialAccounts.filter(
      (financialAccount) => {
        return normalizeWords(
          financialAccount.name.toLowerCase(),
          true,
        ).includes(normalizeWords(inputFilter.toLowerCase(), true))
      },
    )

    return newFinancialAccounts
  }, [inputFilter, data])

  const selectedFinancialAccount = useMemo(() => {
    const financialAccountId = watch('financialAccountId')
    if (!data) return null
    if (!financialAccountId) return null
    const financialAccount = data.financialAccounts.find(
      (financialAccount) => financialAccount.id === financialAccountId,
    )
    return financialAccount
  }, [data, watch('financialAccountId'), initialData?.financialAccountId])

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="">
          {step === 'CHOOSE_FINANCIAL_ACCOUNT' && (
            <div className="space-y-4 px-6 pb-6">
              <div className="space-y-1">
                <p>Qual é a conta que esse novo cartão deve pertencer?</p>
                <Input
                  disabled={isLoading}
                  value={inputFilter}
                  onChange={(e) => setInputFilter(e.target.value)}
                  placeholder="Digite o nome da conta..."
                />
              </div>
              {isLoading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-auto">
                  <div className="flex h-max max-h-[400px] flex-wrap gap-2">
                    {financialAccountsFiltred.length > 0 ? (
                      financialAccountsFiltred.map((financialAccount) => {
                        return (
                          <button
                            key={financialAccount.id}
                            type="button"
                            className="group relative flex min-h-[120px] min-w-[220px] max-w-[220px] flex-1 flex-col items-center justify-center gap-2 rounded-md border p-3 shadow-sm"
                            onClick={() =>
                              handleChoiceFinancialAccount(financialAccount.id)
                            }
                          >
                            {/* <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger>
                              <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center">
                                <Component className="size-4 text-muted-foreground" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Integração com Open finance disponível.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider> */}
                            <Image
                              src={financialAccount.bank.imageUrl}
                              alt="Imagem do banco"
                              width={40}
                              height={40}
                              className="rounded-full group-hover:opacity-80"
                            />
                            <span className="text-sm font-medium tracking-tight group-hover:text-muted-foreground">
                              {financialAccount.name}
                            </span>
                            {/* <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        onClick={() =>
                          handleChoiceFinancialInstitution(bank.id)
                        }
                      >
                        <ChevronRight className="size-5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                      </Button> */}
                          </button>
                        )
                      })
                    ) : (
                      <div className="flex w-full flex-col items-center justify-center gap-1.5">
                        <span className="text-lg font-medium leading-none tracking-tight">
                          Nenhuma conta bancária criada ainda.
                        </span>
                        <span className="text-sm leading-none tracking-tight text-muted-foreground">
                          Crie uma conta agora para vincular seu cartão de
                          crédito.
                        </span>
                        <Button
                          onClick={() => setShowFinancialAccountModal(true)}
                        >
                          Criar conta
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {step === 'CREDIT_CARD_DATA' && (
            <div className="space-y-6">
              <div className="space-y-6 overflow-auto px-6">
                {/* <div className="flex items-start gap-4"> */}
                <FormField
                  control={control}
                  name="name"
                  disabled={isSubmitting}
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col space-y-1">
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={`Ex: Cartão do ${selectedFinancialAccount?.name ?? 'Cartão X'}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-start gap-4">
                  <FormField
                    control={control}
                    name="limit"
                    disabled={isSubmitting}
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col space-y-1">
                        <FormLabel
                          className={cn(
                            isUpdating && 'cursor-not-allowed opacity-70',
                          )}
                        >
                          Limite do cartão de crédito
                        </FormLabel>
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
                              field.onChange(floatValue)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="invoiceClosingDate"
                    disabled={isSubmitting}
                    render={({ field }) => (
                      <FormItem className="flex w-[200px] flex-col space-y-1">
                        <FormLabel>Dia fechamento</FormLabel>
                        <Select
                          disabled={isSubmitting}
                          onValueChange={(value) => {
                            field.onChange(Number(value))
                          }}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Fechamento do cartão" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 31 }).map((_, i) => {
                              const day = i + 1
                              return (
                                <SelectItem
                                  key={day.toString()}
                                  value={day.toString()}
                                >
                                  {day}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="invoiceDueDate"
                    disabled={isSubmitting}
                    render={({ field }) => (
                      <FormItem className="flex w-[200px] flex-col space-y-1">
                        <FormLabel>Dia vencimento</FormLabel>
                        <Select
                          disabled={isSubmitting}
                          onValueChange={(value) => {
                            field.onChange(Number(value))
                          }}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Vencimento do cartão" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 31 }).map((_, i) => {
                              const day = i + 1
                              return (
                                <SelectItem
                                  key={day.toString()}
                                  value={day.toString()}
                                >
                                  {day}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* </div> */}

                <div className="flex items-start gap-4">
                  <FormField
                    control={control}
                    name="financialAccountId"
                    disabled={isSubmitting || isLoading}
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col space-y-1">
                        <FormLabel>Conta</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                disabled={isSubmitting || isLoading}
                                className={cn(
                                  'max-h-9 min-h-9 flex-1 items-center justify-between p-0 pl-3',
                                  !field.value && 'text-muted-foreground',
                                  (isSubmitting || isLoading) &&
                                    'cursor-not-allowed opacity-50',
                                )}
                              >
                                {selectedFinancialAccount ? (
                                  <div className="flex items-center justify-center">
                                    <Image
                                      src={
                                        selectedFinancialAccount.bank.imageUrl
                                      }
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
                                  'Selecione uma conta'
                                )}
                                <CaretSortIcon className="ml-2 mr-3 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[280px] p-0"
                            align="start"
                          >
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
                                  {data?.financialAccounts.map((item) => {
                                    return (
                                      <CommandItem
                                        key={item.id}
                                        disabled={isSubmitting || isLoading}
                                        className={cn(
                                          'cursor-pointer',
                                          (isSubmitting || isLoading) &&
                                            'cursor-not-allowed opacity-50',
                                        )}
                                        onSelect={() => {
                                          setValue(
                                            'financialAccountId',
                                            item.id,
                                            { shouldValidate: true },
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
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="flag"
                    disabled={isSubmitting}
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col space-y-1">
                        <FormLabel>Bandeira</FormLabel>
                        <Select
                          disabled={isSubmitting}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a bandeira do cartão" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(creditCardFlags).map(([, item]) => {
                              // const Icon = item.icon
                              return (
                                <SelectItem key={item.value} value={item.value}>
                                  <div className="flex flex-row items-center">
                                    {/* <Icon className="mr-2 size-4 shrink-0 text-muted-foreground" /> */}
                                    {item.label}
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  {/* <Label className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  <Palette className="mr-2 size-5 shrink-0 text-muted-foreground" />
                  Cor da conta
                </Label> */}
                  <FormField
                    control={control}
                    name="color"
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col space-y-1">
                        <FormLabel className="flex items-center ">
                          {' '}
                          <Palette
                            className="mr-2 size-5 shrink-0"
                            style={{
                              color:
                                watch('color') ?? 'var(--muted-foreground)',
                            }}
                          />{' '}
                          Cor do cartão de crédito
                        </FormLabel>
                        <FormControl>
                          <RadioGroup.Root
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-2"
                          >
                            <FormItem className="space-y-0">
                              <FormControl>
                                <RadioGroup.Item
                                  className="relative h-8 w-8 rounded-full bg-[#7e22ce] shadow-sm outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                  value="#7e22ce"
                                  id="purple"
                                >
                                  <RadioGroup.Indicator className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                                    <Check className="size-5 text-background" />
                                  </RadioGroup.Indicator>
                                </RadioGroup.Item>
                              </FormControl>
                            </FormItem>

                            <FormItem className="space-y-0">
                              <FormControl>
                                <RadioGroup.Item
                                  className="relative h-8 w-8 rounded-full bg-[#1d4ed8] shadow-sm outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                  value="#1d4ed8"
                                  id="blue"
                                >
                                  <RadioGroup.Indicator className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                                    <Check className="size-5 text-background" />
                                  </RadioGroup.Indicator>
                                </RadioGroup.Item>
                              </FormControl>
                            </FormItem>

                            <FormItem className="space-y-0">
                              <FormControl>
                                <RadioGroup.Item
                                  className="relative h-8 w-8 rounded-full bg-[#be123c] shadow-sm outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                  value="#be123c"
                                  id="rose"
                                >
                                  <RadioGroup.Indicator className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                                    <Check className="size-5 text-background" />
                                  </RadioGroup.Indicator>
                                </RadioGroup.Item>
                              </FormControl>
                            </FormItem>

                            <FormItem className="space-y-0">
                              <FormControl>
                                <RadioGroup.Item
                                  className="relative h-8 w-8 rounded-full bg-[#c2410c] shadow-sm outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                  value="#c2410c"
                                  id="orange"
                                >
                                  <RadioGroup.Indicator className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                                    <Check className="size-5 text-background" />
                                  </RadioGroup.Indicator>
                                </RadioGroup.Item>
                              </FormControl>
                            </FormItem>
                          </RadioGroup.Root>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn('w-fit justify-between')}
                      >
                        Mais opções de cores
                      </Button>
                    </PopoverTrigger>
                    <PopoverPortal>
                      <PopoverContent className="w-auto p-3" align="start">
                        <span className="mb-2 block text-sm leading-none tracking-tight">
                          Selecione uma cor
                        </span>
                        <HexColorPicker
                          color={watch('color')}
                          onChange={(color) =>
                            setValue('color', color, { shouldValidate: true })
                          }
                        />
                      </PopoverContent>
                    </PopoverPortal>
                  </Popover>
                </div>
              </div>
              <div className="flex items-start justify-end gap-2 px-6 pb-6">
                <DialogClose asChild>
                  <Button type="button" variant="ghost" disabled={isSubmitting}>
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                  )}
                  Salvar cartão
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
      <CreateOrUpdateFinancialAccountModal
        open={showFinancialAccountModal}
        handleOpenChangeModal={setShowFinancialAccountModal}
      />
    </>
  )
}
