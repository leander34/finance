'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { CaretSortIcon } from '@radix-ui/react-icons'
import { PopoverPortal } from '@radix-ui/react-popover'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { normalizeWords } from '@saas/core'
import { useQuery } from '@tanstack/react-query'
import { HTTPError } from 'ky'
import {
  Check,
  CheckIcon,
  ChevronRight,
  FilePen,
  HelpCircle,
  Loader2,
  Palette,
  TriangleAlert,
  Unplug,
} from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { toast } from 'sonner'
import { z } from 'zod'

import { CustomInputNumber } from '@/components/global/custom-input-number'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
  FormDescription,
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
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { fetchBanksHttp } from '@/http/banks/fetch-banks-http'
import { createFinancialAccountHttp } from '@/http/financial-accounts/create-financial-account-http'
import { updateFinancialAccountHttp } from '@/http/financial-accounts/update-financial-account-http'
import { queryClient } from '@/lib/react-query'
import { cn } from '@/lib/utils'
import { accountTypes } from '@/utlis/account-types'

import { Icons } from '../ui/icons'

type Steps =
  | 'CHOOSE_FINANCIAL_INSTITUTION'
  | 'INTEGRATION_TYPE'
  | 'ACCOUNT_DATA'

const financialAccountFormSchema = z.object({
  name: z.string({
    required_error: 'Por favor, digite um nome para a conta.',
  }),
  initialBalance: z
    .number({
      invalid_type_error: 'Valor inválido.',
      required_error: 'Saldo inicial inválido.',
    })
    .nonnegative({ message: 'Valor não pode ser negativo.' }),
  visibledInOverallBalance: z.boolean().default(false),
  accountType: z
    .union([
      z.literal('CC'),
      z.literal('CP'),
      z.literal('CI'),
      z.literal('DINHEIRO'),
      z.literal('OUTROS'),
    ])
    .default('CC'),
  financialInstitutionId: z
    .string({
      required_error: 'Por favor, selecione uma instituição financeira.',
    })
    .uuid(),
  accountIntegrationType: z
    .union([z.literal('OPEN_FINANCE'), z.literal('MANUAL')])
    .default('MANUAL'),
  color: z.string({ required_error: 'Por favor, selecione uma cor.' }),
})

export type FinancialAccountFormData = z.infer<
  typeof financialAccountFormSchema
>

interface CreateFinancialAccountFormProps {
  handleCloseModal(newValue: boolean): void
  isUpdating?: boolean
  initialData?: {
    id: string
    name: string
    initialBalance: number
    visibledInOverallBalance: boolean
    accountType: FinancialAccountFormData['accountType']
    financialInstitutionId: string
    color: string
  }
}
export function CreateOrUpdateFinancialAccountForm({
  isUpdating = false,
  initialData,
  handleCloseModal,
}: CreateFinancialAccountFormProps) {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  const [step, setStep] = useState<Steps>(
    isUpdating ? 'ACCOUNT_DATA' : 'CHOOSE_FINANCIAL_INSTITUTION',
  )

  const form = useForm<FinancialAccountFormData>({
    resolver: zodResolver(financialAccountFormSchema),
    defaultValues: {
      name: initialData?.name,
      initialBalance: initialData?.initialBalance,
      accountType: initialData?.accountType ?? 'CC',
      visibledInOverallBalance: initialData?.visibledInOverallBalance ?? true,
      // financialInstitutionId: initialData?.financialInstitutionId,
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
    queryKey: ['secondary', 'banks'],
    queryFn: async () => {
      // await fakeDelay(1000)
      return fetchBanksHttp()
    },
  })

  console.log(watch('initialBalance'))

  useEffect(() => {
    if (
      initialData?.financialInstitutionId &&
      !watch('financialInstitutionId')
    ) {
      setValue('financialInstitutionId', initialData.financialInstitutionId)
    }
  }, [initialData?.financialInstitutionId, watch('financialInstitutionId')])

  const selectedFinancialInstitution = useMemo(() => {
    const financialInstitutionId = watch('financialInstitutionId')
    if (!data) return null
    if (!financialInstitutionId) return null
    const instF = data.banks.find((bank) => bank.id === financialInstitutionId)
    return instF
  }, [data, watch('financialInstitutionId')])

  function handleChoiceFinancialInstitution(financialInstitutionId: string) {
    setValue('financialInstitutionId', financialInstitutionId)
    setStep('INTEGRATION_TYPE')
  }

  function handleChoiceIntegrationType(
    accountIntegrationType: FinancialAccountFormData['accountIntegrationType'],
  ) {
    setValue('accountIntegrationType', accountIntegrationType)
    setStep('ACCOUNT_DATA')
  }

  const onSubmit: SubmitHandler<FinancialAccountFormData> = async (inputs) => {
    console.log({
      slug: currentOrg,
      name: inputs.name,
      initialBalance: inputs.initialBalance,
      accountType: inputs.accountType,
      financialInstitutionId: inputs.financialInstitutionId,
      accountIntegrationType: inputs.accountIntegrationType,
      color: inputs.color,
      visibledInOverallBalance: inputs.visibledInOverallBalance,
    })

    try {
      if (isUpdating) {
        if (!initialData) return
        await updateFinancialAccountHttp({
          slug: currentOrg,
          financialAccountId: initialData.id,
          name: inputs.name,
          accountType: inputs.accountType,
          financialInstitutionId: inputs.financialInstitutionId,
          color: inputs.color,
          visibledInOverallBalance: inputs.visibledInOverallBalance,
        })
      } else {
        await createFinancialAccountHttp({
          slug: currentOrg,
          name: inputs.name,
          initialBalance: inputs.initialBalance,
          accountType: inputs.accountType,
          financialInstitutionId: inputs.financialInstitutionId,
          accountIntegrationType: inputs.accountIntegrationType,
          color: inputs.color,
          visibledInOverallBalance: inputs.visibledInOverallBalance,
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

      toast.success('Conta salva com sucesso!')
      handleCloseModal(false)
      // handleChangeTransactionTab(null)
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

  const banksFiltred = useMemo(() => {
    if (!data) return []
    const newBanks = data?.banks.filter((bank) => {
      return normalizeWords(bank.name.toLowerCase(), true).includes(
        normalizeWords(inputFilter.toLowerCase(), true),
      )
    })

    return newBanks
  }, [inputFilter, data])

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="">
        {step === 'CHOOSE_FINANCIAL_INSTITUTION' && (
          <div className="space-y-4 px-6 pb-6">
            <div className="space-y-1">
              <p>
                Qual é a instituição financeira da conta que você quer
                adicionar?
              </p>
              <Input
                disabled={isLoading}
                value={inputFilter}
                onChange={(e) => setInputFilter(e.target.value)}
                placeholder="Digite o nome da instituição..."
              />
            </div>
            {isLoading ? (
              <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-auto">
                <div className="flex h-max max-h-[400px] flex-wrap gap-2">
                  {banksFiltred.map((bank) => {
                    return (
                      <button
                        key={bank.id}
                        type="button"
                        className="group relative flex min-h-[120px] min-w-[220px] max-w-[220px] flex-1 flex-col items-center justify-center gap-2 rounded-md border p-3 shadow-sm"
                        onClick={() =>
                          handleChoiceFinancialInstitution(bank.id)
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
                          src={bank.imageUrl}
                          alt="Imagem do banco"
                          width={40}
                          height={40}
                          className="rounded-full group-hover:opacity-80"
                        />
                        <span className="text-sm font-medium tracking-tight group-hover:text-muted-foreground">
                          {bank.name}
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
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {step === 'INTEGRATION_TYPE' && !!selectedFinancialInstitution && (
          <div className="space-y-4 px-6 pb-6">
            <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
              <Image
                src={selectedFinancialInstitution.imageUrl}
                alt="Imagem do banco"
                width={40}
                height={40}
                className="mr-2 rounded-full"
              />

              <span className="text-base font-medium tracking-tight group-hover:text-muted-foreground">
                {selectedFinancialInstitution.name}
              </span>
            </div>
            <div>
              <span className="text-lg font-medium leading-none tracking-tight">
                De que forma você quer adicionar essa conta?
              </span>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                disabled
                onClick={() => handleChoiceIntegrationType('OPEN_FINANCE')}
                className="group relative flex w-full items-center rounded-md border p-3 text-left shadow-sm"
              >
                {/* <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <X className="size-10 text-destructive" strokeWidth={1} />
              </div> */}
                <Unplug className="mr-3 size-5 shrink-0 text-muted-foreground group-hover:opacity-80 group-disabled:opacity-60" />
                <div className="flex flex-col items-start space-y-1 group-hover:opacity-80 group-disabled:opacity-60">
                  <span className="text-lg font-medium leading-none tracking-tight">
                    Automática
                  </span>
                  <p className="max-w-xl text-sm leading-none tracking-tight text-muted-foreground">
                    As receitas e despesas serão atualizadas automaticamente uma
                    vez ao dia, cabendo a você somente categorizá-las.
                  </p>
                  {/* <span className="text-sm text-destructive">
                    Indisponível no momento
                  </span> */}
                </div>
                <Button
                  disabled
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => handleChoiceIntegrationType('OPEN_FINANCE')}
                >
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground group-hover:text-foreground group-disabled:text-muted-foreground" />
                </Button>
              </button>
              <button
                type="button"
                onClick={() => handleChoiceIntegrationType('MANUAL')}
                className="group flex w-full items-center rounded-md border p-3 text-left shadow-sm"
              >
                <FilePen className="mr-3 size-5 shrink-0 text-muted-foreground group-hover:opacity-80" />
                <div className="flex flex-col items-start space-y-1 group-hover:opacity-80">
                  <span className="text-lg font-medium leading-none tracking-tight">
                    Manual
                  </span>
                  <p className="max-w-xl text-sm leading-none tracking-tight text-muted-foreground">
                    As receitas, despesas e categorizações das transações terão
                    que ser adicionadas manualmente.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => handleChoiceIntegrationType('MANUAL')}
                >
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                </Button>
              </button>

              <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4 shrink-0" />
                <AlertTitle>Integração automática indisponível</AlertTitle>
                <AlertDescription>
                  No momento não é possível integrar sua conta com o Open
                  Finance.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}
        {step === 'ACCOUNT_DATA' && (
          <div className="space-y-6">
            <div className="h-[500px] space-y-6 overflow-auto px-6">
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
                        placeholder={`Ex: Conta do ${selectedFinancialInstitution?.name ?? 'Banco X'}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="initialBalance"
                disabled={isSubmitting}
                render={({ field }) => (
                  <FormItem className="flex flex-1 flex-col space-y-1">
                    <FormLabel
                      className={cn(
                        isUpdating && 'cursor-not-allowed opacity-70',
                      )}
                    >
                      Saldo inicial
                    </FormLabel>
                    <FormControl>
                      <NumericFormat
                        name={field.name}
                        onBlur={field.onBlur}
                        getInputRef={field.ref}
                        value={field.value}
                        disabled={field.disabled || isUpdating}
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
              {/* </div> */}

              <div className="flex items-start gap-4">
                <FormField
                  control={control}
                  name="financialInstitutionId"
                  disabled={isSubmitting || isLoading}
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col space-y-1">
                      <FormLabel>Intituição financeira</FormLabel>
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
                              {selectedFinancialInstitution ? (
                                <div className="flex items-center justify-center">
                                  <Image
                                    src={selectedFinancialInstitution.imageUrl}
                                    alt={selectedFinancialInstitution.name}
                                    className="mr-2 rounded-full"
                                    width={24}
                                    height={24}
                                  />
                                  <span className="inline-flex pr-4">
                                    {selectedFinancialInstitution.name}
                                  </span>
                                </div>
                              ) : (
                                'Selecione uma intituição financeira'
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
                                Nenhuma instituição financeira encontrada.
                              </CommandEmpty>
                              <CommandGroup heading="Contas">
                                {data?.banks.map((item) => {
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
                                          'financialInstitutionId',
                                          item.id,
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
                  name="accountType"
                  disabled={isSubmitting}
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col space-y-1">
                      <FormLabel>Tipo da conta</FormLabel>
                      <Select
                        disabled={isSubmitting}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo da conta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(accountTypes).map(([, item]) => {
                            const Icon = item.icon
                            return (
                              <SelectItem key={item.value} value={item.value}>
                                <div className="flex flex-row items-center">
                                  <Icon className="mr-2 size-4 shrink-0 text-muted-foreground" />
                                  {item.name}
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
                            color: watch('color') ?? 'var(--muted-foreground)',
                          }}
                        />{' '}
                        Cor da conta
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

              <FormField
                control={control}
                name="visibledInOverallBalance"
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
                      <FormLabel>Incluir na soma da tela inicial?</FormLabel>
                      <FormDescription>
                        Desmarque essa opção caso não queria contabilizar as
                        despesas e receitas dessa conta nos cálculos da página
                        inicial.
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
                Salvar conta
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  )
}
