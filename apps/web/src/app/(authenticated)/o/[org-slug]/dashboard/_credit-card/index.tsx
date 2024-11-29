import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { CardSpendingRelevanceChart } from './card-spending-relevance-chart'
import { CreditCardSpendingChartGroupedByDay } from './credit-card-spending-chart-grouped-by-day'
import { CreditCardSpendingChartGroupedByMonth } from './credit-card-spending-chart-grouped-by-month'

export function CreditCardInsights() {
  return (
    <Card>
      <CardHeader className="border-b pb-2">
        <CardTitle>Cartões de credito</CardTitle>
        <CardDescription>Ingsiths sobre as categorias</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 bg-muted pt-6">
        <div className="grid grid-cols-7 gap-4">
          <CreditCardSpendingChartGroupedByMonth />
          <CardSpendingRelevanceChart />
        </div>
        <div>
          <CreditCardSpendingChartGroupedByDay />
        </div>
      </CardContent>
    </Card>
  )
}
