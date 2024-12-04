'use client'
import { ArrowLeft } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { ChooseTransactionType } from './choose-transaction-type'
import { useNewTransaction } from './hook'
import { NewExpense } from './new-expense'
import { NewRevenue } from './new-revenue'
import { NewTransfer } from './new-transfer'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './sheet'
export type PossibleFormTypes = 'despesa' | 'receita' | 'transferencia'
export function NewTransactionSheet() {
  const searchParams = useSearchParams()
  const {
    isNewTranscationSheetOpen,
    handleChangeNewTransactionSheet,
    transactionTab,
    handleChangeTransactionTab,
  } = useNewTransaction()

  // const [activeFrom, setActiveForm] = useState<PossibleFormTypes | null>(() => {
  //   console.log('tab')
  //   console.log(searchParams.get('tab'))
  //   return (searchParams.get('tab') as PossibleFormTypes) ?? null
  // })

  useEffect(() => {
    console.log('oi')
  }, [searchParams])
  // function handleNewTransactionTypeChoice(
  //   chosenForm: PossibleFormTypes | null,
  // ) {
  //   setActiveForm(chosenForm)
  // }
  return (
    <Sheet
      open={isNewTranscationSheetOpen}
      onOpenChange={(open) => {
        handleChangeNewTransactionSheet(open, transactionTab)
        setTimeout(() => {
          handleChangeTransactionTab(null)
        }, 300)
      }}
    >
      <SheetContent className="flex w-fit flex-col transition-all duration-700">
        {transactionTab !== null && (
          <SheetHeader className="border-b p-4 px-4 pt-4">
            <button
              onClick={() => handleChangeTransactionTab(null)}
              className="inline-flex w-fit items-center gap-1 text-sm tracking-tight text-muted-foreground hover:underline"
            >
              <ArrowLeft className="size-4" />
              Voltar
            </button>
            <SheetTitle>
              {transactionTab === 'despesa' && 'Nova despesa'}
              {transactionTab === 'receita' && 'Nova receita'}
              {transactionTab === 'transferencia' &&
                'Nova transferência de saldo'}
            </SheetTitle>
            <SheetDescription>
              {transactionTab === 'despesa' && 'Lançamento de despesa'}
              {transactionTab === 'receita' && 'Lançamento de receita'}
              {transactionTab === 'transferencia' &&
                'Enviar saldo para outra conta'}
            </SheetDescription>
          </SheetHeader>
        )}
        {/* <div
          className={cn(
            'h-[200px] w-[300px] bg-red-500 transition-all duration-1000',
            activeFrom === 'EXPENSE' && '',
          )}
        >
          oidaid
        </div>

        <div
          aria-hidden={activeFrom !== 'EXPENSE'}
          className={cn(
            'invisible h-0 w-0 bg-red-500 transition-all duration-1000',
            activeFrom === 'EXPENSE' && 'visible h-[200px] w-[700px]',
          )}
        ></div> */}

        <div className="max-h-full flex-1 overflow-hidden">
          {transactionTab === null && <ChooseTransactionType />}
          {transactionTab === 'despesa' && <NewExpense />}
          {transactionTab === 'receita' && <NewRevenue />}
          {transactionTab === 'transferencia' && <NewTransfer />}
        </div>
        {/* <SheetFooter className="border-t">
          <SheetClose asChild>
            <Button type="submit">Fechar</Button>
          </SheetClose>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  )
}
