import { zodResolver } from '@hookform/resolvers/zod'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { moneyFormatter } from '@saas/core'
import { HTTPError } from 'ky'
import { AlertTriangle, Check, EllipsisVertical, Palette } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { toast } from 'sonner'
import { z } from 'zod'

import { archiveFinancialAccountAction } from '@/actions/financial-accounts/archive-financial-account'
import { deleteFinancialAccountAction } from '@/actions/financial-accounts/delete-financial-account'
import { editFinancialAccountVisibilityAction } from '@/actions/financial-accounts/edit-financial-account-visibility'
import { unarchiveFinancialAccountAction } from '@/actions/financial-accounts/unarchive-financial-account'
import { CreateOrUpdateFinancialAccountModal } from '@/components/global/create-or-update-financial-account-modal'
import { CustomInputNumber } from '@/components/global/custom-input-number'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Icons } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { useCustomTransition } from '@/hooks/use-custom-transition'
import { adjustFinancialAccountBalanceHttp } from '@/http/financial-accounts/adjust-financial-account-balance-http'
import type { FetchFinancialAccountsWithDetailsHttpResponse } from '@/http/financial-accounts/fetch-financial-accounts-with-details'
import { queryClient } from '@/lib/react-query'
import { cn } from '@/lib/utils'
interface AccountActionsDropdownProps {
  account: FetchFinancialAccountsWithDetailsHttpResponse['financialAccounts'][0]
}
export function AccountActionsDropdown({
  account,
}: AccountActionsDropdownProps) {
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [showFinancialAccountModal, setShowFinancialAccountModal] =
    useState(false)

  const [
    showEditFinancialAccountBalanceModal,
    setShowEditFinancialAccountBalanceModal,
  ] = useState(false)

  const [, handleDeleteAccount, isDeleteAccountPending] = useCustomTransition(
    deleteFinancialAccountAction,
    { errors: null, message: null, success: false },
    async (message) => {
      setShowDeleteAccountModal(false)
      await queryClient.invalidateQueries({
        queryKey: ['primary'],
        exact: false,
      })
      toast.success(message)
    },
    (message) => {
      toast.error(message)
    },
  )

  const [, handleArchiveAccount, isArchiveAccountPending] = useCustomTransition(
    archiveFinancialAccountAction,
    { errors: null, message: null, success: false },
    async (message) => {
      await queryClient.invalidateQueries({
        queryKey: ['primary'],
        exact: false,
      })
      toast.success(message)
    },
    (message) => {
      toast.error(message)
    },
  )

  const [, handleUnarchiveAccount, isUnarchiveAccountPending] =
    useCustomTransition(
      unarchiveFinancialAccountAction,
      { errors: null, message: null, success: false },
      async (message) => {
        await queryClient.invalidateQueries({
          queryKey: ['primary'],
          exact: false,
        })
        toast.success(message)
      },
      (message) => {
        toast.error(message)
      },
    )

  const [, handleChangeAccountVisibility, isEditAccountVisibilityPending] =
    useCustomTransition<{
      financialAccountId: string
      visibledInOverallBalance: boolean
    }>(
      editFinancialAccountVisibilityAction,
      { errors: null, message: null, success: false },
      async (message) => {
        await queryClient.invalidateQueries({
          queryKey: ['primary'],
          exact: false,
        })
        toast.success(message)
      },
      (message) => {
        toast.error(message)
      },
    )

  const isSomeActionPending =
    isDeleteAccountPending ||
    isArchiveAccountPending ||
    isUnarchiveAccountPending ||
    isEditAccountVisibilityPending
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="" size="icon" variant="ghost">
          {isSomeActionPending ? (
            <Icons.spinner className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <EllipsisVertical className="size-4 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel className="flex items-center">
          <Image
            src={account.bank.imageUrl}
            alt={account.bank.name}
            className="mr-2 size-6 rounded-full"
            width={24}
            height={24}
          />
          <span>{account.name}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setShowFinancialAccountModal(true)}>
            Editar
          </DropdownMenuItem>
          {account.archivedAt === null ? (
            <DropdownMenuItem
              onClick={() => handleArchiveAccount(account.id)}
              disabled={isArchiveAccountPending}
            >
              {isArchiveAccountPending && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )}
              Arquivar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => handleUnarchiveAccount(account.id)}
              disabled={isUnarchiveAccountPending}
            >
              {isUnarchiveAccountPending && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )}
              Desarquivar
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setShowEditFinancialAccountBalanceModal(true)}
          >
            Reajuste de saldo
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {/* <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Ver transações</DropdownMenuItem>
          <DropdownMenuItem>Relatórios da conta</DropdownMenuItem>
          <DropdownMenuItem>Importar dados com arquivo OFX</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Conectar com Open Finance</DropdownMenuItem>
        </DropdownMenuGroup> */}
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              Visível na página inicial
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  disabled={account.visibledInOverallBalance}
                  onClick={() =>
                    handleChangeAccountVisibility({
                      financialAccountId: account.id,
                      visibledInOverallBalance:
                        !account.visibledInOverallBalance,
                    })
                  }
                >
                  Sim
                  <Check
                    className={cn(
                      'ml-auto size-4 shrink-0 text-muted-foreground opacity-0',
                      account.visibledInOverallBalance && 'opacity-100',
                    )}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!account.visibledInOverallBalance}
                  onClick={() =>
                    handleChangeAccountVisibility({
                      financialAccountId: account.id,
                      visibledInOverallBalance:
                        !account.visibledInOverallBalance,
                    })
                  }
                >
                  Não{' '}
                  <Check
                    className={cn(
                      'ml-auto size-4 shrink-0 text-muted-foreground opacity-0',
                      account.visibledInOverallBalance === false &&
                        'opacity-100',
                    )}
                  />
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setShowDeleteAccountModal(true)}
          disabled={isDeleteAccountPending}
          className="focus:text-accent-foreground:text-destructive text-destructive"
        >
          {isDeleteAccountPending && (
            <Icons.spinner className="mr-2 size-4 animate-spin" />
          )}
          Deletar conta
        </DropdownMenuItem>
      </DropdownMenuContent>
      <AlertDialog
        open={showDeleteAccountModal}
        onOpenChange={setShowDeleteAccountModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente sua
              conta e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteAccountPending}>
              Cancelar
            </AlertDialogCancel>
            <Button
              onClick={() => handleDeleteAccount(account.id)}
              disabled={isDeleteAccountPending}
            >
              {isDeleteAccountPending && (
                <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
              )}
              Continuar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <CreateOrUpdateFinancialAccountModal
        initialData={{
          id: account.id,
          name: account.name,
          initialBalance: account.initialBalance,
          color: account.color,
          accountType: account.accountType,
          financialInstitutionId: account.bank.id,
          visibledInOverallBalance: account.visibledInOverallBalance,
        }}
        isUpdating
        handleOpenChangeModal={setShowFinancialAccountModal}
        open={showFinancialAccountModal}
      />
      <ModalEditFinancialAccountBalance
        open={showEditFinancialAccountBalanceModal}
        handleChangeOpen={setShowEditFinancialAccountBalanceModal}
        financialAccountId={account.id}
        initialBalance={account.initialBalance}
        currentBankBalance={account.currentBankBalance}
      />
    </DropdownMenu>
  )
}

const editfinancialAccountBalanceFormSchema = z.object({
  description: z.string().optional(),
  adjustTo: z.number({
    invalid_type_error: 'Valor inválido.',
    required_error: 'Valor inválido.',
  }),
  type: z.union([
    z.literal('ADJUSTMENT_TRANSACTION'),
    z.literal('CHANGE_INITIAL_BALANCE'),
  ]),
})

export type EditfinancialAccountBalanceFormData = z.infer<
  typeof editfinancialAccountBalanceFormSchema
>
interface ModalEditFinancialAccountBalanceProps {
  open: boolean
  handleChangeOpen(open: boolean): void
  financialAccountId: string
  initialBalance: number
  currentBankBalance: number
}
export function ModalEditFinancialAccountBalance({
  open,
  handleChangeOpen,
  financialAccountId,
  currentBankBalance,
  initialBalance,
}: ModalEditFinancialAccountBalanceProps) {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  const form = useForm<EditfinancialAccountBalanceFormData>({
    resolver: zodResolver(editfinancialAccountBalanceFormSchema),
    defaultValues: {
      type: 'ADJUSTMENT_TRANSACTION',
      description: '',
      adjustTo: currentBankBalance,
    },
  })
  const {
    watch,
    setValue,
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = form

  // useEffect(() => {
  //   setValue('adjustTo', currentBankBalance)
  // }, [currentBankBalance])
  const onSubmit: SubmitHandler<EditfinancialAccountBalanceFormData> = async (
    inputs,
  ) => {
    console.log(inputs)

    try {
      await adjustFinancialAccountBalanceHttp({
        slug: currentOrg,
        adjustTo: inputs.adjustTo,
        type: inputs.type,
        description: inputs.description ?? null,
        financialAccountId,
      })

      await queryClient.invalidateQueries({
        queryKey: ['primary'],
        exact: false,
      })

      form.reset({
        adjustTo: inputs.adjustTo,
        description: undefined,
        type: undefined,
      })

      toast.success('Saldo reajustado com sucesso!')
      handleChangeOpen(false)
    } catch (error) {
      console.log(error)
      if (error instanceof HTTPError) {
        const { message } = await error.response.json()
        toast.error(message)
      }
    }
  }

  function handleChangeOpenModal(open: boolean) {
    handleChangeOpen(open)
    form.reset({
      adjustTo: undefined,
      description: undefined,
      type: undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleChangeOpenModal}>
      <DialogContent className="max-h-[80%] gap-0 overflow-hidden p-0 lg:max-w-[50%] 2xl:max-w-3xl">
        <DialogHeader className="p-6">
          <DialogTitle>Reajuste de saldo</DialogTitle>
          <DialogDescription>
            Reajuste o saldo da conta da maneira que preferir
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="overflow-auto">
              <div className="max-h-[480px] space-y-6 px-6">
                <div>
                  <FormField
                    control={control}
                    name="adjustTo"
                    disabled={isSubmitting}
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col space-y-1">
                        <FormLabel>Reajustar saldo para</FormLabel>
                        <FormControl>
                          <NumericFormat
                            name={field.name}
                            onBlur={field.onBlur}
                            getInputRef={field.ref}
                            value={field.value}
                            disabled={field.disabled}
                            allowNegative={true}
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
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm leading-none tracking-tight text-muted-foreground">
                      Saldo inicial da conta
                    </span>
                    <span className="text-base font-medium leading-none tracking-tight">
                      {moneyFormatter(initialBalance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm leading-none tracking-tight text-muted-foreground">
                      Saldo atual da conta
                    </span>
                    <span className="text-base font-medium leading-none tracking-tight">
                      {moneyFormatter(currentBankBalance)}
                    </span>
                  </div>
                </div>
                <div>
                  <FormField
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col">
                        <FormLabel className="flex items-center ">
                          Como você gostaria de reajustar o saldo?
                        </FormLabel>
                        <FormControl>
                          <RadioGroup.Root
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-4"
                          >
                            <FormItem className="flex-1 space-y-0">
                              <FormControl>
                                <RadioGroup.Item
                                  className="relative flex min-h-[200px] flex-col items-center justify-center rounded-md border-2 p-4 shadow-sm outline-none focus:ring-1 focus:ring-primary data-[state=checked]:border-primary"
                                  value="ADJUSTMENT_TRANSACTION"
                                  id="ADJUSTMENT_TRANSACTION"
                                >
                                  <div className="flex flex-col space-y-1.5">
                                    <span className="font-medium tracking-tight">
                                      Criar transação de ajuste
                                    </span>
                                    <span className="text-sm tracking-tight text-muted-foreground">
                                      Para ajustar seu saldo uma despesa de
                                      ajuste será criada.
                                    </span>
                                  </div>
                                  <RadioGroup.Indicator className="absolute right-2 top-2">
                                    <Check className="size-5 shrink-0" />
                                  </RadioGroup.Indicator>
                                </RadioGroup.Item>
                              </FormControl>
                            </FormItem>
                            <FormItem className="flex-1 space-y-0">
                              <FormControl>
                                <RadioGroup.Item
                                  className="relative flex min-h-[200px] flex-col items-center justify-center rounded-md border-2 p-4 shadow-sm outline-none focus:ring-1 focus:ring-primary data-[state=checked]:border-primary"
                                  value="CHANGE_INITIAL_BALANCE"
                                  id="CHANGE_INITIAL_BALANCE"
                                >
                                  <div className="flex flex-col space-y-1.5">
                                    <span className="font-medium tracking-tight">
                                      Modificar saldo inicial
                                    </span>
                                    <span className="text-sm tracking-tight text-muted-foreground">
                                      Essa opção altera seu saldo inicial para
                                      reajustar seu saldo atual. Ao fazer isso,
                                      alguns dos seus saldos do final do mês
                                      serão impactados.
                                    </span>
                                    <div className="flex items-center justify-center gap-2 text-destructive">
                                      <AlertTriangle className="size-4 shrink-0 " />
                                      <span className="text-sm tracking-tight ">
                                        Não recomendado
                                      </span>
                                    </div>
                                  </div>
                                  <RadioGroup.Indicator className="absolute right-2 top-2">
                                    <Check className="size-5 shrink-0" />
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
                </div>
                {watch('type') === 'ADJUSTMENT_TRANSACTION' && (
                  <div className="pb-1">
                    <FormField
                      control={control}
                      name="description"
                      disabled={isSubmitting}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Descrição" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-start justify-end gap-2 px-6 pb-6">
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">
                {/* {isSubmitting && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )} */}
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
