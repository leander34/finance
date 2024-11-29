import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  CreateOrUpdateFinancialAccountForm,
  type FinancialAccountFormData,
} from './create-or-update-financial-account-form'
interface CreateOrUpdateFinancialAccountModalProps {
  handleOpenChangeModal(newValue: boolean): void
  open: boolean
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
export function CreateOrUpdateFinancialAccountModal({
  handleOpenChangeModal,
  open,
  initialData,
  isUpdating,
}: CreateOrUpdateFinancialAccountModalProps) {
  return (
    <Dialog open={open} onOpenChange={handleOpenChangeModal}>
      <DialogContent className="max-h-[80%] gap-0 overflow-auto p-0 lg:max-w-[50%] 2xl:max-w-3xl">
        <DialogHeader className="p-6">
          <DialogTitle>
            {isUpdating ? 'Atualizar conta' : 'Criar nova conta'}
          </DialogTitle>
          <DialogDescription>
            Crie uma nova conta para adicionar despesas e receitas
          </DialogDescription>
        </DialogHeader>
        <CreateOrUpdateFinancialAccountForm
          initialData={initialData}
          isUpdating={isUpdating}
          handleCloseModal={handleOpenChangeModal}
        />
      </DialogContent>
    </Dialog>
  )
}
