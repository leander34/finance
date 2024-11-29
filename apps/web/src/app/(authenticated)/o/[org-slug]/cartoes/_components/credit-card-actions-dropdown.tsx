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

import { archiveCreditCardAction } from '@/actions/credit-cards/archive-credit-card'
import { deleteCreditCardAction } from '@/actions/credit-cards/delete-credit-card'
import { unarchiveCreditCardAction } from '@/actions/credit-cards/unarchive-credit-card'
import { archiveFinancialCreditCardAction } from '@/actions/financial-creditcards/archive-financial-creditcard'
import { deleteFinancialCreditCardAction } from '@/actions/financial-creditcards/delete-financial-creditcard'
import { editFinancialCreditCardVisibilityAction } from '@/actions/financial-creditcards/edit-financial-creditcard-visibility'
import { unarchiveFinancialCreditCardAction } from '@/actions/financial-creditcards/unarchive-financial-creditcard'
import { deletePaymentsFromACreditCardInvoiceAction } from '@/actions/invoices/delete-payments-from-a-credit-card-invoice'
import { CreateOrUpdateCreditCardModal } from '@/components/global/create-or-update-credit-card-modal'
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
import type { FetchCreditCardsWithDetailsHttpResponse } from '@/http/credit-cards/fetch-credit-cards-with-details-http'
import { queryClient } from '@/lib/react-query'
import { cn } from '@/lib/utils'

import { InvoicePaymentModal } from './invoice-payment-modal'
interface CreditCardActionsDropdownProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  creditCard: FetchCreditCardsWithDetailsHttpResponse['creditCards'][0]
}
export function CreditCardActionsDropdown({
  creditCard,
}: CreditCardActionsDropdownProps) {
  const [showDeleteCreditCardModal, setShowDeleteCreditCardModal] =
    useState(false)
  const [showCreditCardModal, setShowCreditCardModal] = useState(false)
  const [showInvoicePaymentModal, setShowInvoicePaymentModal] = useState(false)

  const [, handleDeleteCreditCard, isDeleteCreditCardPending] =
    useCustomTransition(
      deleteCreditCardAction,
      { errors: null, message: null, success: false },
      async (message) => {
        setShowDeleteCreditCardModal(false)
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

  const [, handleArchiveCreditCard, isArchiveCreditCardPending] =
    useCustomTransition(
      archiveCreditCardAction,
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

  const [, handleUnarchiveCreditCard, isUnarchiveCreditCardPending] =
    useCustomTransition(
      unarchiveCreditCardAction,
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

  const [
    ,
    handleDeleteAllPaymentsFromACreditCardInvoice,
    isDeleteAllPaymentsFromACreditCardInvoicePending,
  ] = useCustomTransition(
    deletePaymentsFromACreditCardInvoiceAction,
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

  // const [
  //   ,
  //   handleChangeCreditCardVisibility,
  //   isEditCreditCardVisibilityPending,
  // ] = useCustomTransition<{
  //   financialCreditCardId: string
  //   visibledInOverallBalance: boolean
  // }>(
  //   editCreditCardVisibilityAction,
  //   { errors: null, message: null, success: false },
  //   async (message) => {
  //     await queryClient.invalidateQueries({
  //       queryKey: ['primary'],
  //       exact: false,
  //     })
  //     toast.success(message)
  //   },
  //   (message) => {
  //     toast.error(message)
  //   },
  // )

  const isSomeActionPending =
    isDeleteCreditCardPending ||
    isArchiveCreditCardPending ||
    isUnarchiveCreditCardPending
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
            src={creditCard.financialAccount.bank.imageUrl}
            alt={creditCard.financialAccount.bank.name}
            className="mr-2 size-6 rounded-full"
            width={24}
            height={24}
          />
          <span>{creditCard.name}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setShowCreditCardModal(true)}>
            Editar
          </DropdownMenuItem>
          {creditCard.archivedAt === null ? (
            <DropdownMenuItem
              onClick={() => handleArchiveCreditCard(creditCard.id)}
              disabled={isArchiveCreditCardPending}
            >
              {isArchiveCreditCardPending && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )}
              Arquivar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => handleUnarchiveCreditCard(creditCard.id)}
              disabled={isUnarchiveCreditCardPending}
            >
              {isUnarchiveCreditCardPending && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )}
              Desarquivar
            </DropdownMenuItem>
          )}

          {creditCard.invoice && creditCard.invoice.amountOfPayments > 0 && (
            <DropdownMenuItem>Ver pagamentos da fatura</DropdownMenuItem>
          )}

          {creditCard.invoice && creditCard.invoice.currentInvoiceValue > 0 && (
            <DropdownMenuItem onClick={() => setShowInvoicePaymentModal(true)}>
              Pagar fatura
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* <DropdownMenuGroup>
          <DropdownMenuItem>Ver todas faturas</DropdownMenuItem>
          <DropdownMenuItem>Ver transações</DropdownMenuItem>
          <DropdownMenuItem>Relatórios do cartão</DropdownMenuItem>
          <DropdownMenuItem>Importar dados com arquivo OFX</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator /> */}

        <DropdownMenuItem
          onClick={() => setShowDeleteCreditCardModal(true)}
          disabled={isDeleteCreditCardPending}
          className="focus:text-accent-foreground:text-destructive text-destructive"
        >
          {isDeleteCreditCardPending && (
            <Icons.spinner className="mr-2 size-4 animate-spin" />
          )}
          Deletar cartão
        </DropdownMenuItem>
        {creditCard.invoice &&
          creditCard.invoice.id &&
          creditCard.invoice.amountOfPayments > 0 && (
            <DropdownMenuItem
              onClick={() =>
                handleDeleteAllPaymentsFromACreditCardInvoice(
                  creditCard.invoice!.id,
                )
              }
              disabled={isDeleteAllPaymentsFromACreditCardInvoicePending}
              className="focus:text-accent-foreground:text-destructive text-destructive"
            >
              {isDeleteAllPaymentsFromACreditCardInvoicePending && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )}
              Excluir pagamentos da fatura
            </DropdownMenuItem>
          )}
      </DropdownMenuContent>
      <AlertDialog
        open={showDeleteCreditCardModal}
        onOpenChange={setShowDeleteCreditCardModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente seu
              cartão e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteCreditCardPending}>
              Cancelar
            </AlertDialogCancel>
            <Button
              onClick={() => handleDeleteCreditCard(creditCard.id)}
              disabled={isDeleteCreditCardPending}
            >
              {isDeleteCreditCardPending && (
                <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
              )}
              Continuar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <CreateOrUpdateCreditCardModal
        initialData={{
          id: creditCard.id,
          financialAccountId: creditCard.financialAccount.id,
          name: creditCard.name,
          color: creditCard.color,
          flag: creditCard.flag,
          invoiceClosingDate: creditCard.invoiceClosingDate,
          invoiceDueDate: creditCard.invoiceDueDate,
          limit: creditCard.limit,
        }}
        isUpdating
        handleOpenChangeModal={setShowCreditCardModal}
        open={showCreditCardModal}
      />
      <InvoicePaymentModal
        handleOpenChangeModal={setShowInvoicePaymentModal}
        open={showInvoicePaymentModal}
        currentInvoiceValue={creditCard?.invoice?.currentInvoiceValue ?? 0}
        invoiceId={creditCard.invoice?.id ?? null}
        defaultFinancialAccountId={creditCard.financialAccount.id}
      />
    </DropdownMenu>
  )
}
