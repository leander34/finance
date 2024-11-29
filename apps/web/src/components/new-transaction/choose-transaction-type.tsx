'use client'
import {
  ArrowRightLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import { Separator } from '../ui/separator'
import { useNewTransaction } from './hook'
// interface ChooseTransactionTypeProps {
//   handleNewTransactionTypeChoice(chosenForm: PossibleFormTypes | null): void
// }
export function ChooseTransactionType() {
  const { handleChangeTransactionTab } = useNewTransaction()
  return (
    <div className="mx-auto h-full max-w-[556px] p-4">
      <div className="flex flex-col">
        <span className="text-lg font-medium tracking-tight">
          Crie um novo lançamento
        </span>
        <span className="text-sm tracking-tight text-muted-foreground">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio
          rem quasi blanditiis magni pariatur.
        </span>
      </div>
      <Separator className="mb-2 mt-6" />
      <div className="space-y-2">
        <button
          onClick={() => handleChangeTransactionTab('despesa')}
          className="group flex w-[540px] cursor-pointer items-center gap-3 rounded p-2 px-4 hover:bg-muted"
        >
          <span className="flex items-center justify-center rounded bg-destructive p-2">
            <TrendingDown
              className="size-8 text-primary-foreground text-white"
              strokeWidth={1.6}
            />
          </span>
          <div className="flex flex-col space-y-1.5">
            <p className="text-start font-semibold leading-none tracking-tight">
              Nova despesa
            </p>
            <span className="text-start text-sm leading-tight tracking-tight">
              Adicione uma nova desapesa criada por um{' '}
              <span className="font-semibold">cartão de débito/crédito</span>,
              <span className="font-semibold"> dinheiro</span>,{' '}
              <span className="font-semibold">pix</span>, ou qualquer outro
              método.
            </span>
          </div>
          <ChevronRight className="ml-auto size-5 shrink-0 text-muted-foreground transition-colors duration-300 group-hover:text-foreground/75" />
        </button>
        <button
          onClick={() => handleChangeTransactionTab('receita')}
          className="group flex w-[540px] cursor-pointer items-center gap-3 rounded p-2 px-4 hover:bg-muted"
        >
          <span className="flex items-center justify-center rounded bg-green-500 p-2">
            <TrendingUp
              className="size-8 text-primary-foreground text-white"
              strokeWidth={1.6}
            />
          </span>
          <div className="flex flex-col space-y-1.5">
            <p className="text-start font-semibold leading-none tracking-tight">
              Nova receita
            </p>
            <span className="text-start text-sm leading-tight tracking-tight">
              Adicione uma nova receita já recebida ou que será recebida,
              independentemente da forma de recebimento.
            </span>
          </div>
          <ChevronRight className="ml-auto size-5 shrink-0 text-muted-foreground transition-colors duration-300 group-hover:text-foreground/75" />
        </button>

        {/* <button className="group flex w-[540px] cursor-pointer items-center gap-3 rounded p-2 px-4 hover:bg-muted">
          <span className="flex items-center justify-center rounded bg-orange-500 p-2">
            <CreditCard
              className="size-8 text-primary-foreground text-white"
              strokeWidth={1.6}
            />
          </span>
          <div className="flex flex-col space-y-1.5">
            <p className="text-start font-semibold leading-none tracking-tight">
              Nova despesa no cartão de crédito
            </p>
            <span className="text-start text-sm leading-tight tracking-tight">
              Adicione uma nova receita já recebida ou que será recebida,
              independentemente da forma de recebimento.
            </span>
          </div>
          <ChevronRight className="ml-auto size-5 shrink-0 text-muted-foreground transition-colors duration-300 group-hover:text-foreground/75" />
        </button> */}
        <button
          onClick={() => handleChangeTransactionTab('transferencia')}
          className="group flex w-[540px] cursor-pointer items-center gap-3 rounded p-2 px-4 hover:bg-muted"
        >
          <span className="flex items-center justify-center rounded bg-sky-500 p-2">
            <ArrowRightLeft
              className="z-10 size-8  text-white"
              strokeWidth={1.6}
            />
          </span>
          <div className="flex flex-col space-y-1.5">
            <p className="text-start font-semibold leading-none tracking-tight">
              Transferência de saldo entre contas
            </p>
            <span className="text-start text-sm leading-tight tracking-tight">
              Transfira saldo de uma conta para outra.
            </span>
          </div>
          <ChevronRight className="ml-auto size-5 shrink-0 text-muted-foreground transition-colors duration-300 group-hover:text-foreground/75" />
        </button>
      </div>
    </div>
  )
}
