import type { CreateCreditCardHttpRequest } from '@/http/credit-cards/create-credit-card-http'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { CreateOrUpdateCreditCardForm } from './create-or-update-credit-card-form'
interface CreateOrUpdateCreditCardModalProps {
  handleOpenChangeModal(newValue: boolean): void
  open: boolean
  isUpdating?: boolean
  initialData?: {
    id: string
    financialAccountId: string
    name: string
    limit: number
    invoiceClosingDate: number
    invoiceDueDate: number
    flag: CreateCreditCardHttpRequest['flag']
    color: string
  }
}
export function CreateOrUpdateCreditCardModal({
  handleOpenChangeModal,
  open,
  initialData,
  isUpdating,
}: CreateOrUpdateCreditCardModalProps) {
  return (
    <Dialog open={open} onOpenChange={handleOpenChangeModal}>
      <DialogContent className="max-h-[80%] gap-0 overflow-auto p-0 lg:max-w-[50%] 2xl:max-w-3xl">
        <DialogHeader className="p-6">
          <DialogTitle>
            {isUpdating
              ? 'Atualizar cartão de crédito'
              : 'Criar novo cartão de crédito'}
          </DialogTitle>
          <DialogDescription>
            Crie um novo cartão de crédito para adicionar despesas
          </DialogDescription>
        </DialogHeader>
        <CreateOrUpdateCreditCardForm
          initialData={initialData}
          isUpdating={isUpdating}
          handleCloseModal={handleOpenChangeModal}
        />
      </DialogContent>
    </Dialog>
  )
}
