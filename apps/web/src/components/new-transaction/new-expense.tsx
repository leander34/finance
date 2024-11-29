import { zodResolver } from '@hookform/resolvers/zod'
import { CaretSortIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { dayjs, fakeDelay, installmentValue } from '@saas/core'
import { useMutation, useQuery } from '@tanstack/react-query'
import { HTTPError } from 'ky'
import {
  CalendarIcon,
  CheckIcon,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Clock,
  FolderUp,
  HeartCrack,
  HelpCircle,
  Loader2,
  type LucideIcon,
  Trash2,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { api } from '@/http/api-client'
import { getExpenseCategoriesHttp } from '@/http/categories/get-expense-categories'
import { getAccountsAndCreditCardsHttp } from '@/http/get-accounts-and-credit-cards-http'
import { createTagHttp } from '@/http/tags/create-tag'
import { getAllTagsHttp } from '@/http/tags/get-all-tags'
import { getExpenseTagsHttp } from '@/http/tags/get-expense-tags'
import {
  createTransactionHttp,
  type CreateTransactionRequest,
} from '@/http/transactions/create-transaction-http'
import { queryClient } from '@/lib/react-query'
import { cn } from '@/lib/utils'
import { iconMapper } from '@/utlis/icon-mapper'

import { CustomInputNumber } from '../global/custom-input-number'
import { Badge } from '../ui/badge'
import { Calendar } from '../ui/calendar'
import { Checkbox } from '../ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../ui/command'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Icons } from '../ui/icons'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Progress } from '../ui/progress'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'
import { useNewTransaction } from './hook'
import type { PossibleFormTypes } from './new-transaction-sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from './transaction-dialog'

const newExpenseFormSchema = z
  .object({
    description: z
      .string({
        required_error: 'Por favor, digite uma descrição para a despesa.',
      })
      .min(5, { message: 'A descrição deve conter pelo menos 5 caracteres.' }),
    amount: z
      .number({
        invalid_type_error: 'Valor inválido.',
        required_error: 'Valor inválido.',
      })
      .positive({ message: 'Valor deve ser maior do que zero.' }),
    alreadyPaid: z.boolean().default(true),
    realizationDate: z.date({
      required_error: 'Por favor, selecione uma data.',
    }),
    category: z
      .string({
        required_error: 'Por favor, selecione a categoria da despesa.',
      })
      .uuid(),
    observation: z.string().optional(),
    tags: z.array(z.string().uuid()).default([]),
    skip: z.boolean().default(false),
    transactionDestination: z.object(
      {
        type: z.union([
          z.literal('CREDT_CARD'),
          z.literal('FINANCIAL_ACCOUNT'),
        ]),
        financialAccountId: z.string().uuid().nullable(),
        creditCardId: z.string().uuid().nullable(),
      },
      { required_error: 'Selecione uma conta ou cartão de crédito.' },
    ),
    launchType: z
      .union([
        z.literal('SINGLE_LAUNCH'),
        z.literal('INSTALLMENT_LAUNCH'),
        z.literal('RECURRENT_LAUNCH'),
      ])
      .default('SINGLE_LAUNCH'),
    recurrencePeriod: z
      .union([
        z.literal('anual'),
        z.literal('semestral'),
        z.literal('trimestral'),
        z.literal('bimestral'),
        z.literal('mensal'),
        z.literal('quinzenal'),
        z.literal('semanal'),
        z.literal('diario'),
      ])
      .default('mensal'),
    amountOfInstallments: z.string(),
    installmentsPeriod: z
      .union([
        z.literal('anos'),
        z.literal('semestres'),
        z.literal('trimestres'),
        z.literal('bimestres'),
        z.literal('meses'),
        z.literal('quinzenas'),
        z.literal('semanas'),
        z.literal('dias'),
      ])
      .default('meses'),
  })
  .refine(
    (data) => {
      if (data.launchType === 'RECURRENT_LAUNCH' && !data.recurrencePeriod) {
        return false
      }
      return true
    },
    {
      path: ['recurrencePeriod'],
      message:
        'Por favor, selecione uma frequência de repetição para a despesa fixa.',
    },
  )
  .refine(
    (data) => {
      if (
        data.launchType === 'INSTALLMENT_LAUNCH' &&
        (!data.amountOfInstallments || !data.installmentsPeriod)
      ) {
        return false
      }
      return true
    },
    {
      path: ['amountOfInstallments', 'installmentsPeriod'],
      message:
        'Por favor, selecione a quantidade de parcela e a frequência de repetição',
    },
  )

type NewExpenseFormData = z.infer<typeof newExpenseFormSchema>

export function NewExpense() {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  const { handleChangeTransactionTab } = useNewTransaction()
  // const { currentOrg } = useCookies()
  const form = useForm<NewExpenseFormData>({
    resolver: zodResolver(newExpenseFormSchema),
    defaultValues: {
      tags: [],
      launchType: 'SINGLE_LAUNCH',
      alreadyPaid: true,
      skip: false,
      recurrencePeriod: 'mensal',
      amountOfInstallments: '2',
      installmentsPeriod: 'meses',
      realizationDate: dayjs().toDate(),
    },
  })
  const [showModal, setShowModal] = useState(false)
  const [inputTags, setInputTags] = useState('')
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
    getValues,
    trigger,
  } = form
  const [showMore, setShowMore] = useState(false)
  const refContainer = useRef<HTMLDivElement>(null)

  const realizationDate = watch('realizationDate')
  const alreadyPaid = watch('alreadyPaid')

  useEffect(() => {
    if (!realizationDate) return
    if (dayjs(realizationDate).isAfter(dayjs()) && alreadyPaid) {
      setValue('alreadyPaid', false)
    }
  }, [realizationDate])

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['secondary', 'categories', 'expense', currentOrg],
    queryFn: () => {
      return getExpenseCategoriesHttp(currentOrg)
    },
    enabled: !!currentOrg,
  })

  const {
    data: accountAndCreditCardsData,
    isLoading: isLoadingAccountsAndCreditCards,
  } = useQuery({
    queryKey: ['secondary', 'accounts-and-credit-cards', currentOrg],
    queryFn: () => {
      return getAccountsAndCreditCardsHttp(currentOrg)
    },
    enabled: !!currentOrg,
  })

  const {
    data: tagsData,
    isLoading: isLoadingTags,
    refetch,
  } = useQuery({
    queryKey: ['secondary', 'tags', currentOrg],
    queryFn: async () => {
      return getAllTagsHttp(currentOrg)
    },
    enabled: !!currentOrg,
  })

  const mutationCreateTag = useMutation({
    mutationFn: () => {
      return createTagHttp({
        slug: currentOrg,
        name: inputTags,
        color: null,
      })
    },
    // onMutate: (variables) => {
    //   // Cancel current queries for the todos list
    //   // await queryClient.cancelQueries({ queryKey: [currentOrg, 'tags'] })
    //   console.log('variables')
    //   console.log(variables)

    //   // Create optimistic todo
    //   const optimisticTag = { name: inputTags }

    //   // Add optimistic todo to todos list
    //   queryClient.setQueryData(
    //     [currentOrg, 'tags'],
    //     (oldTags: GetRevenueTagsResponse['tags']) => [
    //       ...oldTags,
    //       optimisticTag,
    //     ],
    //   )
    //   // Return context with the optimistic todo
    //   return { optimisticTag }
    // },
    onSuccess: async ({ tag }) => {
      console.log(tag)
      await queryClient.refetchQueries({
        queryKey: ['secondary', 'tags'],
      })
      setInputTags('')
      setTimeout(() => {
        const currentTags = getValues('tags') || []
        console.log('current tags', currentTags)

        const newTags = [...currentTags, tag.id]
        setValue('tags', newTags)
        console.log('new tags', newTags)
      }, 0)
    },
    async onError(error) {
      if (error instanceof HTTPError) {
        const { message } = await error.response.json()
        toast.error(message)
      }
    },
  })

  console.log(watch('tags'))
  // console.log(tagsData?.tags)

  const onSubmit: SubmitHandler<NewExpenseFormData> = async (inputs) => {
    console.log('oi')
    if (
      !inputs.transactionDestination.financialAccountId &&
      !inputs.transactionDestination.creditCardId
    )
      return
    const launchType = inputs.launchType
    const body: CreateTransactionRequest = {
      slug: currentOrg,
      degreeOfNeed: 1,
      amount: inputs.amount * -1,
      type: 'EXPENSE',
      realizationDate: dayjs(inputs.realizationDate).format('YYYY-MM-DD'),
      skip: inputs.skip,
      description: inputs.description,
      observation: inputs.observation,
      alreadyPaid: inputs.alreadyPaid,
      launchType,
      recurrencePeriod:
        launchType === 'RECURRENT_LAUNCH' ? inputs.recurrencePeriod : null,
      amountOfInstallments:
        launchType === 'INSTALLMENT_LAUNCH'
          ? Number(inputs.amountOfInstallments)
          : null,
      installmentsPeriod:
        launchType === 'INSTALLMENT_LAUNCH' ? inputs.installmentsPeriod : null,
      category: inputs.category,
      tags: inputs.tags,
      // attachments: [''],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }

    if (inputs.transactionDestination.financialAccountId) {
      body.financialAccountId = inputs.transactionDestination.financialAccountId
      // body.creditCardId = null
    }

    if (inputs.transactionDestination.creditCardId) {
      body.creditCardId = inputs.transactionDestination.creditCardId
      // body.financialAccountId = null
    }
    console.log(body)

    try {
      await createTransactionHttp(body)
      // form.reset({
      //   amount: 0,
      //   description: '',
      //   alreadyPaid: true,
      //   transactionDestination: undefined,
      //   category: undefined,
      //   launchType: 'SINGLE_LAUNCH',
      //   amountOfInstallments: '2',
      //   installmentsPeriod: 'meses',
      //   realizationDate: dayjs().toDate(),
      //   observation: '',
      //   recurrencePeriod: 'mensal',
      //   skip: false,
      //   tags: undefined,
      // })

      await queryClient.invalidateQueries({
        queryKey: ['primary'],
        exact: false,
      })

      // await queryClient.invalidateQueries({
      //   queryKey: ['overview'],
      //   exact: false,
      // })

      // await queryClient.invalidateQueries({
      //   queryKey: ['monthly-expenses-transactions'],
      //   exact: false,
      // })

      toast.success('Despesa criada com sucesso!')
      handleChangeTransactionTab(null)
    } catch (error) {
      console.log(error)
      if (error instanceof HTTPError) {
        const { message } = await error.response.json()
        toast.error(message)
      }
    }
  }

  const financialAccounts = useMemo(() => {
    if (!accountAndCreditCardsData) return []
    return accountAndCreditCardsData.items.filter(
      (item) => item.financialAccountId,
    )
  }, [accountAndCreditCardsData])

  const creditCards = useMemo(() => {
    if (!accountAndCreditCardsData) return []
    return accountAndCreditCardsData.items.filter((item) => item.creditCardId)
  }, [accountAndCreditCardsData])

  // const isDisabled = isSubmitting

  // const isFetchSomeData =
  //   isLoadingCategories ||
  //   isLoadingAccountsAndCreditCards ||
  //   isLoadingTags ||
  //   mutationCreateTag.isPending

  const alreadyExistsATagWithThisName = tagsData?.tags.find(
    (option) => option.name.toLowerCase() === inputTags.toLowerCase(),
  )

  const filtredTags = useMemo(() => {
    const items = tagsData?.tags.filter((item) => {
      return item.name.toLowerCase().includes(inputTags.toLowerCase())
    })
    if (!items) return []
    return items
  }, [inputTags, tagsData])

  const selectedAccountOrCreditCard = useMemo(() => {
    const transactionDestination = watch('transactionDestination')
    if (!accountAndCreditCardsData) return null
    if (!transactionDestination) return null
    const accountOrCreditCard = accountAndCreditCardsData.items.find((item) => {
      if (
        item.creditCardId === transactionDestination.creditCardId &&
        item.creditCardId !== null &&
        transactionDestination.creditCardId !== null
      ) {
        return true
      }

      if (
        item.financialAccountId === transactionDestination.financialAccountId &&
        item.financialAccountId !== null &&
        transactionDestination.financialAccountId !== null
      ) {
        return true
      }

      return false
    })
    return accountOrCreditCard
  }, [accountAndCreditCardsData, watch('transactionDestination')])

  const selectedCategory = useMemo(() => {
    const category = watch('category')
    if (!accountAndCreditCardsData) return null
    if (!category) return null

    return categoriesData?.categories.find((item) => item.id === category)
  }, [categoriesData, watch('category')])

  function categoryIcon(icon: keyof typeof iconMapper) {
    const Icon = iconMapper[icon]
    return <Icon className="mr-2 size-5" />
  }

  return (
    <div className="relative h-full max-h-full" ref={refContainer}>
      {isSubmitting && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-secondary/40">
          <Loader2 className="size-6 animate-spin" />
        </div>
      )}
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex h-full flex-col"
        >
          <div className="flex flex-1 overflow-hidden">
            <div
              id="left"
              className="left w-[660px] space-y-6 overflow-auto p-4"
            >
              <FormField
                control={control}
                name="description"
                disabled={isSubmitting}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: Compra no mercado da esquina"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-start gap-4">
                <div className="flex flex-1 flex-col gap-1">
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
                    name="alreadyPaid"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-end gap-2 space-y-0">
                        <FormDescription className="">
                          Despesa já foi paga?
                        </FormDescription>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={
                              watch('transactionDestination.type') ===
                                'CREDT_CARD' || isSubmitting
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="realizationDate"
                  disabled={isSubmitting}
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col space-y-1">
                      <FormLabel>Data da compra</FormLabel>
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
                                dayjs(field.value).format('DD [de] MMM[,] YYYY')
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
              </div>

              <div className="flex flex-1 items-start gap-4">
                <FormField
                  control={control}
                  name="transactionDestination"
                  disabled={isSubmitting || isLoadingAccountsAndCreditCards}
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col">
                      <FormLabel>Conta/Cartão</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              disabled={
                                isSubmitting || isLoadingAccountsAndCreditCards
                              }
                              className={cn(
                                'max-h-9 min-h-9 flex-1 justify-between p-0 pl-3',
                                !field.value && 'text-muted-foreground',
                                (isSubmitting ||
                                  isLoadingAccountsAndCreditCards) &&
                                  'cursor-not-allowed opacity-50',
                              )}
                            >
                              {selectedAccountOrCreditCard ? (
                                <div className="flex items-center justify-center">
                                  <Image
                                    src={selectedAccountOrCreditCard.imageUrl}
                                    alt={selectedAccountOrCreditCard.name}
                                    className="mr-2 rounded-full"
                                    width={24}
                                    height={24}
                                  />
                                  <div className="flex items-center pr-4">
                                    <span className="inline-flex ">
                                      {selectedAccountOrCreditCard.name}
                                    </span>
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      {selectedAccountOrCreditCard.financialAccountId &&
                                        '(conta)'}
                                      {selectedAccountOrCreditCard.creditCardId &&
                                        '(cartão)'}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                'Selecione uma conta ou cartão'
                              )}
                              <CaretSortIcon className="ml-2 mr-3 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Procure uma conta ou cartão..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                Nenhuma conta ou cartão encontrado.
                              </CommandEmpty>
                              <CommandGroup heading="Contas">
                                {financialAccounts.length > 0 ? (
                                  financialAccounts.map((item) => {
                                    return (
                                      <CommandItem
                                        key={item.financialAccountId}
                                        disabled={
                                          isSubmitting ||
                                          isLoadingAccountsAndCreditCards
                                        }
                                        className={cn(
                                          'cursor-pointer',
                                          (isSubmitting ||
                                            isLoadingAccountsAndCreditCards) &&
                                            'cursor-not-allowed opacity-50',
                                        )}
                                        onSelect={() => {
                                          setValue(
                                            'transactionDestination',
                                            {
                                              creditCardId: null,
                                              financialAccountId:
                                                item.financialAccountId!,
                                              type: 'FINANCIAL_ACCOUNT',
                                            },
                                            { shouldValidate: true },
                                          )
                                        }}
                                      >
                                        <Image
                                          src={item.imageUrl}
                                          alt={item.name}
                                          className="mr-2 size-6 rounded-full"
                                          width={24}
                                          height={24}
                                        />
                                        {item.name}
                                        <CheckIcon
                                          className={cn(
                                            'ml-auto h-4 w-4',
                                            item.financialAccountId ===
                                              field?.value?.financialAccountId
                                              ? 'opacity-100'
                                              : 'opacity-0',
                                          )}
                                        />
                                      </CommandItem>
                                    )
                                  })
                                ) : (
                                  <CommandItem
                                    disabled
                                    className="cursor-not-allowed opacity-50"
                                  >
                                    Nenhuma conta cadastrada.
                                  </CommandItem>
                                )}
                              </CommandGroup>
                              <CommandSeparator />
                              <CommandGroup heading="Cartôes de crédito">
                                {creditCards.length > 0 ? (
                                  creditCards.map((item) => {
                                    return (
                                      <CommandItem
                                        key={item.creditCardId}
                                        disabled={
                                          isSubmitting ||
                                          isLoadingAccountsAndCreditCards
                                        }
                                        className={cn(
                                          'cursor-pointer',
                                          (isSubmitting ||
                                            isLoadingAccountsAndCreditCards) &&
                                            'cursor-not-allowed opacity-50',
                                        )}
                                        onSelect={() => {
                                          setValue(
                                            'transactionDestination',
                                            {
                                              financialAccountId: null,
                                              creditCardId: item.creditCardId!,
                                              type: 'CREDT_CARD',
                                            },
                                            { shouldValidate: true },
                                          )
                                          setValue('alreadyPaid', false)
                                        }}
                                      >
                                        <Image
                                          src={item.imageUrl}
                                          alt={item.name}
                                          className="mr-2 size-6 rounded-full"
                                          width={24}
                                          height={24}
                                        />
                                        {item.name}
                                        <CheckIcon
                                          className={cn(
                                            'ml-auto h-4 w-4',
                                            item.creditCardId ===
                                              field?.value?.creditCardId
                                              ? 'opacity-100'
                                              : 'opacity-0',
                                          )}
                                        />
                                      </CommandItem>
                                    )
                                  })
                                ) : (
                                  <CommandItem
                                    disabled
                                    className="cursor-not-allowed opacity-50"
                                  >
                                    Nenhum cartão cadastrado.
                                  </CommandItem>
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-1 flex-col gap-1">
                  <FormField
                    control={control}
                    name="category"
                    disabled={isSubmitting || isLoadingCategories}
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col">
                        <FormLabel>Categoria da despesa</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                disabled={isSubmitting || isLoadingCategories}
                                className={cn(
                                  'max-h-9 min-h-9 flex-1 justify-between p-0 pl-3',
                                  !field.value && 'text-muted-foreground',
                                  (isSubmitting || isLoadingCategories) &&
                                    'cursor-not-allowed opacity-50',
                                )}
                              >
                                {selectedCategory ? (
                                  <div className="flex items-center justify-center">
                                    {categoryIcon(
                                      selectedCategory.icon as keyof typeof iconMapper,
                                    )}
                                    <span className="inline-flex pr-4">
                                      {selectedCategory.name}
                                    </span>
                                  </div>
                                ) : (
                                  'Selecione uma categoria'
                                )}

                                <CaretSortIcon className="ml-2 mr-3 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[260px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandInput
                                placeholder="Procure uma categoria..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  Nenhum categoria encontrada.
                                </CommandEmpty>
                                <CommandGroup>
                                  {categoriesData?.categories.map(
                                    (category) => {
                                      const Icon =
                                        iconMapper[
                                          category.icon as keyof typeof iconMapper
                                        ]

                                      return (
                                        <CommandItem
                                          value={category.id}
                                          key={category.id}
                                          disabled={
                                            isSubmitting || isLoadingCategories
                                          }
                                          className={cn(
                                            'cursor-pointer',
                                            (isSubmitting ||
                                              isLoadingCategories) &&
                                              'cursor-not-allowed opacity-50',
                                          )}
                                          onSelect={() => {
                                            setValue('category', category.id, {
                                              shouldValidate: true,
                                            })
                                          }}
                                        >
                                          <Icon className="mr-2 size-5" />
                                          {category.name}
                                          <CheckIcon
                                            className={cn(
                                              'ml-auto h-4 w-4',
                                              category.id === field.value
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                            )}
                                          />
                                        </CommandItem>
                                      )
                                    },
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <button
                  type="button"
                  onClick={handleShowInputTags}
                  className="flex items-center gap-1 self-end text-sm tracking-tight text-muted-foreground hover:underline"
                >
                  <Tags className="size-4" />
                  Adicionar tags
                </button> */}
                </div>
              </div>
              {/* {showInputTags && <InputTags />} */}

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Tipo do lançamento
                  </span>
                  <FormField
                    control={control}
                    name="launchType"
                    disabled={isSubmitting}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            disabled={isSubmitting}
                            checked={field.value === 'SINGLE_LAUNCH'}
                            onCheckedChange={() => {
                              field.onChange('SINGLE_LAUNCH')
                            }}
                          />
                        </FormControl>
                        <FormLabel>É uma despesa única.</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="launchType"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            disabled={isSubmitting}
                            checked={field.value === 'RECURRENT_LAUNCH'}
                            onCheckedChange={() => {
                              field.onChange('RECURRENT_LAUNCH')
                            }}
                          />
                        </FormControl>
                        <FormLabel>É uma despesa fixa.</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="launchType"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            disabled={isSubmitting}
                            checked={field.value === 'INSTALLMENT_LAUNCH'}
                            onCheckedChange={() => {
                              field.onChange('INSTALLMENT_LAUNCH')
                            }}
                          />
                        </FormControl>
                        <FormLabel>É uma despesa parcelada.</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                {/* Colocar o conteúdo */}
                {watch('launchType') === 'RECURRENT_LAUNCH' && (
                  <FormField
                    control={control}
                    name="recurrencePeriod"
                    disabled={isSubmitting}
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col">
                        <FormLabel>Frequência da repetição</FormLabel>
                        <Select
                          disabled={isSubmitting}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o período de repetição" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="anual">Anual</SelectItem>
                            <SelectItem value="semestral">Semestral</SelectItem>
                            <SelectItem value="trimestral">
                              Trimestral
                            </SelectItem>
                            <SelectItem value="bimestral">Bimestral</SelectItem>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="quinzenal">Quinzenal</SelectItem>
                            <SelectItem value="semanal">Semanal</SelectItem>
                            <SelectItem value="diario">Diário</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {watch('launchType') === 'INSTALLMENT_LAUNCH' && (
                  <div className="space-y-1">
                    <div className="flex items-start gap-4">
                      <FormField
                        control={control}
                        name="amountOfInstallments"
                        disabled={isSubmitting}
                        render={({ field }) => (
                          <FormItem className="flex flex-1 flex-col">
                            <FormLabel>Quantidade de parcelas</FormLabel>
                            <Select
                              disabled={isSubmitting}
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o período de repetição" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 100 })
                                  .map((_, i) => i + 1)
                                  .map((item) => {
                                    if (item === 1) return null
                                    return (
                                      <SelectItem
                                        key={item}
                                        value={item.toString()}
                                      >
                                        {item}
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
                        name="installmentsPeriod"
                        disabled={isSubmitting}
                        render={({ field }) => (
                          <FormItem className="flex flex-1 flex-col">
                            <FormLabel>Frequência da repetição</FormLabel>
                            <Select
                              disabled={isSubmitting}
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o período de repetição" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="anos">Anos</SelectItem>
                                <SelectItem value="semestres">
                                  Semestres
                                </SelectItem>
                                <SelectItem value="trimestres">
                                  Trimestres
                                </SelectItem>
                                <SelectItem value="bimestres">
                                  Bimestres
                                </SelectItem>
                                <SelectItem value="meses">Meses</SelectItem>
                                <SelectItem value="quinzenas">
                                  Quinzenas
                                </SelectItem>
                                <SelectItem value="semanas">Semanas</SelectItem>
                                <SelectItem value="dias">Dias</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {watch('amount') > 0 && (
                      <div className="flex flex-col">
                        <span className="text-sm tracking-tight">
                          Serão lançadas{' '}
                          <span className="font-medium">
                            {watch('amountOfInstallments')}
                          </span>{' '}
                          parcelas de{' '}
                          <span className="font-medium">
                            R${' '}
                            {installmentValue(
                              watch('amount') ?? 0,
                              Number(watch('amountOfInstallments')) ?? 2,
                            )}
                          </span>
                        </span>
                        <span className="text-xs tracking-tight text-muted-foreground">
                          Em caso de divisão não exata, a sobra será somada à
                          última parcela.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <FormField
                control={control}
                name="skip"
                disabled={isSubmitting}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-md border p-3 shadow-sm">
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <HelpCircle className="size-4 shrink-0 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add to library</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="space-y-0.5">
                      <FormLabel>Ignorar essa transação?</FormLabel>
                      <FormDescription>
                        Ignore essa transação para ela não ser includa na soma
                        da tela inicial.
                      </FormDescription>
                    </div>
                    <FormControl className="ml-auto">
                      <Switch
                        disabled={isSubmitting}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowMore(!showMore)}
                  className="group flex items-center"
                >
                  <span className="text-sm font-medium tracking-tight text-muted-foreground group-hover:underline">
                    {showMore ? 'Mostrar menos opções' : 'Mostrar mais opções'}
                  </span>
                  {showMore ? (
                    <ChevronLeft
                      className="size-5 text-muted-foreground"
                      strokeWidth={1.6}
                    />
                  ) : (
                    <ChevronRight
                      className="size-5 text-muted-foreground"
                      strokeWidth={1.6}
                    />
                  )}
                </button>
              </div>
            </div>
            {showMore && (
              <div
                id="right"
                className="dash w-[500px] space-y-6 overflow-auto border-l border-dashed bg-primary-foreground p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium leading-none tracking-tight">
                    Mais opções
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowMore(false)}
                    className="group"
                  >
                    <X className="size-4 text-muted-foreground transition-colors duration-200 group-hover:text-foreground" />
                  </button>
                </div>
                <FormField
                  control={control}
                  name="tags"
                  disabled={
                    isSubmitting || isLoadingTags || mutationCreateTag.isPending
                  }
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-1 flex-col">
                        <FormLabel>Tags</FormLabel>
                        <Popover>
                          <PopoverTrigger
                            disabled={
                              isSubmitting ||
                              isLoadingTags ||
                              mutationCreateTag.isPending
                            }
                            asChild
                          >
                            <FormControl>
                              <Button
                                variant="outline"
                                className="flex h-fit min-h-9 w-full justify-start"
                              >
                                <PlusCircledIcon className="mr-2 h-4 w-4" />
                                Tags
                                {field.value?.length === 0 && (
                                  <>
                                    <Separator
                                      orientation="vertical"
                                      className="mx-2 h-4"
                                    />
                                    <span className="text-xs font-normal text-muted-foreground">
                                      Nenhuma tag selecionada
                                    </span>
                                  </>
                                )}
                                {field.value?.length > 0 && (
                                  <>
                                    <Separator
                                      orientation="vertical"
                                      className="mx-2 h-4"
                                    />
                                    <div className="hidden gap-y-2 space-x-1 lg:flex lg:flex-wrap">
                                      {tagsData?.tags
                                        .filter((option) =>
                                          field.value.includes(option.id),
                                        )
                                        .map((option) => (
                                          <Badge
                                            variant="secondary"
                                            key={option.id}
                                            className="rounded-sm px-1 font-normal"
                                          >
                                            {option.name}
                                          </Badge>
                                        ))}
                                    </div>
                                  </>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[260px] p-0"
                            align="start"
                          >
                            <Command shouldFilter={false}>
                              <CommandInput
                                value={inputTags}
                                onValueChange={setInputTags}
                                placeholder="Procure ou crie uma tag"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  Nenhuma tag encontrada.
                                </CommandEmpty>
                                {inputTags.trim().length > 0 &&
                                  !alreadyExistsATagWithThisName && (
                                    <>
                                      <CommandGroup>
                                        <CommandItem
                                          onSelect={() => {
                                            mutationCreateTag.mutate()
                                          }}
                                        >
                                          Criar tag "{inputTags}"
                                        </CommandItem>
                                      </CommandGroup>
                                      <CommandSeparator />
                                    </>
                                  )}

                                <CommandGroup>
                                  {filtredTags.map((option) => {
                                    const isSelected = !!field.value.find(
                                      (tag) => tag === option.id,
                                    )
                                    console.log(isSelected)
                                    return (
                                      <CommandItem
                                        key={option.id}
                                        disabled={
                                          mutationCreateTag.isPending ||
                                          isLoadingTags
                                        }
                                        onSelect={() => {
                                          if (
                                            mutationCreateTag.isPending ||
                                            isLoadingTags
                                          )
                                            return
                                          if (isSelected) {
                                            const newTags = field.value.filter(
                                              (tag) => tag !== option.id,
                                            )
                                            setValue('tags', newTags)
                                          } else {
                                            const newTags = [...field.value]
                                            newTags.push(option.id)
                                            setValue('tags', newTags)
                                          }
                                        }}
                                      >
                                        <div
                                          className={cn(
                                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                            isSelected
                                              ? 'bg-primary text-primary-foreground'
                                              : 'opacity-50 [&_svg]:invisible',
                                          )}
                                        >
                                          <CheckIcon
                                            className={cn('h-4 w-4')}
                                          />
                                        </div>
                                        <CircleDashed
                                          className="mr-2 h-4 w-4 text-muted-foreground"
                                          style={{ color: option.color }}
                                        />
                                        <span>{option.name}</span>
                                      </CommandItem>
                                    )
                                  })}
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup>
                                  <CommandItem
                                    onSelect={() => setValue('tags', [])}
                                    className="justify-center text-center"
                                  >
                                    Limpar tags
                                  </CommandItem>
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )
                  }}
                />
                <FormField
                  control={control}
                  name="observation"
                  disabled={isSubmitting}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Use esse campo se desejar descrever mais sobre a despesa. Esse campo não é obrigatório."
                          className="h-28 resize-none bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col items-end gap-1">
                  <label
                    htmlFor=""
                    className="flex w-full cursor-pointer flex-col items-center rounded-md border border-dashed border-input bg-background p-4 hover:border-muted-foreground"
                  >
                    <FolderUp
                      className="size-8 text-muted-foreground"
                      strokeWidth={1.4}
                    />
                    <span className="font-medium tracking-tight">
                      Adicionar anexo
                    </span>
                    <span className="max-w-sm text-center text-sm tracking-tight text-muted-foreground">
                      Adicione fotos, comprovantes ou qualquer imagem que te
                      faça lembrar dessa despesa.
                    </span>
                  </label>
                  <span className="self-end text-xs font-medium tracking-tight text-muted-foreground">
                    Tamanho máximo 5mb por arquivo.
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-base font-medium tracking-tight">
                    Anexos enviados
                  </span>

                  <div className="flex items-center gap-3 rounded-md border bg-background p-2">
                    {/* <XCircle className="size-5 text-red-500" /> */}
                    <Clock className="size-5 text-orange-500" />
                    {/* <CheckCircle className="size-5 text-green-500" /> */}
                    <div>
                      <span className="text-sm font-medium">
                        Cupom do mercado
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>PDF</span>
                        <span>.</span>
                        <span>1mb</span>
                      </div>
                    </div>
                    <div className="flex flex-1">
                      <div className="flex w-full items-center gap-1">
                        <Progress value={33} />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">33%</span>
                          <X className="size-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="group ml-auto"
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </div>
                </div>
                {/* <div className="h-40 w-40 bg-black" />
                <div className="h-40 w-40 bg-black" />
                <div className="h-40 w-40 bg-black" /> */}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 border-t p-4">
            <Button
              disabled={
                isSubmitting ||
                isLoadingCategories ||
                isLoadingAccountsAndCreditCards ||
                isLoadingTags ||
                mutationCreateTag.isPending
              }
              type="button"
              variant="destructive"
            >
              Cancelar
            </Button>
            <Button
              disabled={
                isSubmitting ||
                isLoadingCategories ||
                isLoadingAccountsAndCreditCards ||
                isLoadingTags ||
                mutationCreateTag.isPending
              }
              type="submit"
              onClick={() => setShowModal(true)}
            >
              {isSubmitting && (
                <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
              )}
              Salvar despesa
            </Button>
          </div>

          {/* <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogPortal container={refContainer.current}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're
                    done.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col">
                  <button>😠 estressado</button>
                  <button>😰 ansioso</button>
                  <button>😢 triste</button>
                  <button>😇 normal</button>
                  <button>😀 feliz</button>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </DialogPortal>
          </Dialog> */}
        </form>
      </Form>
    </div>
  )
}
