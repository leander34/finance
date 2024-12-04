import { zodResolver } from '@hookform/resolvers/zod'
import { CaretSortIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { dayjs } from '@saas/core'
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
  Loader2,
  Trash2,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchFinancialAccountsHttp } from '@/http/financial-accounts/fetch-financial-accounts-http'
import { createTagHttp } from '@/http/tags/create-tag'
import { getAllTagsHttp } from '@/http/tags/get-all-tags'
import {
  createTransferHttp,
  type CreateTransferRequest,
} from '@/http/transactions/create-transfer-http'
import { queryClient } from '@/lib/react-query'
import { cn } from '@/lib/utils'

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
import { Separator } from '../ui/separator'
import { Textarea } from '../ui/textarea'
import { useNewTransaction } from './hook'

const newTransferFormSchema = z
  .object({
    amount: z.coerce.number({
      invalid_type_error: 'Valor inválido.',
      required_error: 'Valor inválido.',
    }),
    realizationDate: z.date({
      required_error: 'Por favor, selecione uma data.',
    }),
    sourceAccount: z
      .string({ required_error: 'Conta inválida.' })
      .uuid({ message: 'Conta inválida.' }),
    destinationAccount: z
      .string({ required_error: 'Conta inválida.' })
      .uuid({ message: 'Conta inválida.' }),
    observation: z.string().optional(),
    tags: z.array(z.string().uuid()).default([]),
    launchType: z
      .union([z.literal('SINGLE_LAUNCH'), z.literal('RECURRENT_LAUNCH')])
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
  })
  .refine(
    (data) => {
      if (data.sourceAccount === data.destinationAccount) return false
      return true
    },
    {
      path: ['sourceAccount', 'destinationAccount'],
      message: 'Não é permitido fazer transferências para a mesma conta.',
    },
  )
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

type NewTransferFormData = z.infer<typeof newTransferFormSchema>

export function NewTransfer() {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  const { handleChangeTransactionTab } = useNewTransaction()

  // const { currentOrg } = useCookies()
  const form = useForm<NewTransferFormData>({
    resolver: zodResolver(newTransferFormSchema),
    defaultValues: {
      tags: [],
      launchType: 'SINGLE_LAUNCH',
      recurrencePeriod: 'mensal',
      realizationDate: dayjs().toDate(),
    },
  })
  const [, setShowModal] = useState(false)
  const [inputTags, setInputTags] = useState('')
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
    getValues,
  } = form
  const [showMore, setShowMore] = useState(false)

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

  const { data: tagsData, isLoading: isLoadingTags } = useQuery({
    queryKey: ['secondary', 'tags', currentOrg],
    queryFn: () => {
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
        queryKey: ['secondary', 'tags', 'expense'],
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

  const onSubmit: SubmitHandler<NewTransferFormData> = async (inputs) => {
    const launchType = inputs.launchType
    const body: CreateTransferRequest = {
      slug: currentOrg,
      sourceAccount: inputs.sourceAccount,
      destinationAccount: inputs.destinationAccount,
      amount: inputs.amount,
      realizationDate: dayjs(inputs.realizationDate).format('YYYY-MM-DD'),
      observation: inputs.observation,
      launchType,
      recurrencePeriod:
        launchType === 'RECURRENT_LAUNCH' ? inputs.recurrencePeriod : null,
      tags: inputs.tags,
      description: 'Transferência entre contas',
    }

    try {
      await createTransferHttp(body)
      form.reset({
        amount: 0,
        sourceAccount: '',
        destinationAccount: '',
        launchType: 'SINGLE_LAUNCH',
        realizationDate: dayjs().toDate(),
        observation: '',
        recurrencePeriod: 'mensal',
        tags: undefined,
      })

      await queryClient.invalidateQueries({
        queryKey: ['primary'],
        exact: false,
      })
      toast.success('Tranferência criada com sucesso!')
      handleChangeTransactionTab(null)
    } catch (error) {
      console.log(error)
      if (error instanceof HTTPError) {
        const { message } = await error.response.json()
        toast.error(message)
      }
    }
  }

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

  const selectedSourceAccount = useMemo(() => {
    const sourceAccount = watch('sourceAccount')
    if (!financialAccountData) return null
    if (!sourceAccount) return null
    const account = financialAccountData.financialAccounts.find(
      (item) => item.id === sourceAccount,
    )
    return account
  }, [financialAccountData, watch('sourceAccount')])

  const selectedDestinationAccount = useMemo(() => {
    const destinationAccount = watch('destinationAccount')
    if (!financialAccountData) return null
    if (!destinationAccount) return null
    const account = financialAccountData.financialAccounts.find(
      (item) => item.id === destinationAccount,
    )
    return account
  }, [financialAccountData, watch('destinationAccount')])

  const possibleSourceAccounts = useMemo(() => {
    const destinationAccount = watch('destinationAccount')
    if (!financialAccountData) return []

    const account = financialAccountData?.financialAccounts?.filter(
      (item) => item.id !== destinationAccount,
    )
    return account ?? []
  }, [financialAccountData, watch('destinationAccount')])

  const possibleDestinationAccounts = useMemo(() => {
    const sourceAccount = watch('sourceAccount')
    if (!financialAccountData) return []

    const account = financialAccountData?.financialAccounts?.filter(
      (item) => item.id !== sourceAccount,
    )
    return account ?? []
  }, [financialAccountData, watch('sourceAccount')])

  return (
    <div className="relative h-full max-h-full">
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
                                  setValue('realizationDate', dayjs().toDate())
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
                          Data em que a despesa foi ou será paga.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-1 items-end gap-1">
                  <FormField
                    control={control}
                    name="sourceAccount"
                    disabled={isSubmitting || isLoadingFinancialAccounts}
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col">
                        <FormLabel>Conta origem</FormLabel>
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
                                  (isSubmitting ||
                                    isLoadingFinancialAccounts) &&
                                    'cursor-not-allowed opacity-50',
                                )}
                              >
                                {selectedSourceAccount ? (
                                  <div className="flex items-center justify-center">
                                    <Image
                                      src={selectedSourceAccount.bank.imageUrl}
                                      alt={selectedSourceAccount.name}
                                      className="mr-2 rounded-full"
                                      width={24}
                                      height={24}
                                    />
                                    <span className="inline-flex pr-4">
                                      {selectedSourceAccount.name}
                                    </span>
                                  </div>
                                ) : (
                                  'Selecione uma conta de origem'
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
                                  {possibleSourceAccounts.length > 0 ? (
                                    possibleSourceAccounts.map((item) => {
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
                                            setValue('sourceAccount', item.id, {
                                              shouldValidate: true,
                                            })
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
                                {selectedSourceAccount && (
                                  <>
                                    <CommandSeparator />
                                    <CommandGroup>
                                      <CommandItem asChild>
                                        <Button
                                          type="button"
                                          className="w-full cursor-pointer"
                                          variant="secondary"
                                          onClick={() => {
                                            setValue('sourceAccount', '')
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
                <div className="flex flex-1 flex-col gap-1">
                  <FormField
                    control={control}
                    name="destinationAccount"
                    disabled={isSubmitting || isLoadingFinancialAccounts}
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col">
                        <FormLabel>Conta destino</FormLabel>
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
                                  (isSubmitting ||
                                    isLoadingFinancialAccounts) &&
                                    'cursor-not-allowed opacity-50',
                                )}
                              >
                                {selectedDestinationAccount ? (
                                  <div className="flex items-center justify-center">
                                    <Image
                                      src={
                                        selectedDestinationAccount.bank.imageUrl
                                      }
                                      alt={selectedDestinationAccount.name}
                                      className="mr-2 rounded-full"
                                      width={24}
                                      height={24}
                                    />
                                    <span className="inline-flex pr-4">
                                      {selectedDestinationAccount.name}
                                    </span>
                                  </div>
                                ) : (
                                  'Selecione uma conta de destino'
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
                                  {possibleDestinationAccounts.length > 0 ? (
                                    possibleDestinationAccounts.map((item) => {
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
                                              'destinationAccount',
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

                                {selectedDestinationAccount && (
                                  <>
                                    <CommandSeparator />
                                    <CommandGroup>
                                      <CommandItem asChild>
                                        <Button
                                          type="button"
                                          className="w-full cursor-pointer"
                                          variant="secondary"
                                          onClick={() => {
                                            setValue('destinationAccount', '')
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
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Tipo da transferência
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
                        <FormLabel>É uma transferência única.</FormLabel>
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
                        <FormLabel>É uma transferência fixa.</FormLabel>
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
              </div>

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
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 border-t p-4">
            <Button
              disabled={
                isSubmitting ||
                isLoadingFinancialAccounts ||
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
                isLoadingFinancialAccounts ||
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
        </form>
      </Form>
    </div>
  )
}
