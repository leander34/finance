import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { ExpenseTargetChart } from './expense-target-chart'
import { FinancePlanning } from './finance-planning'
import { RevenueTargetChart } from './revenue-target-chart'
export function FinanceControlCard() {
  return (
    <Card>
      <CardHeader className="border-b pb-2">
        <CardTitle>Controle financeiro</CardTitle>
        <CardDescription>
          Melhore seu controle financeiro nessa sessão.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-4 bg-muted pt-6">
        <div className="grid grid-cols-7 gap-4">
          {/* Planejamento financeiro */}
          <FinancePlanning />
          <div className="col-span-3 flex gap-4">
            <RevenueTargetChart />
            <ExpenseTargetChart />
          </div>
        </div>
        <div className="grid grid-cols-7">
          {/* Objetivos */}
          <Card className="relative col-span-4 overflow-hidden">
            <CardHeader>
              <CardTitle>Objetivos</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">{/* <Overview /> */}</CardContent>
            <div className="absolute inset-0 flex items-center justify-center bg-primary/30 backdrop-blur-[2px]	">
              <div className="flex flex-col">
                <span>Esse recurso é Premium.</span>
                <Button>Assinar agora</Button>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
