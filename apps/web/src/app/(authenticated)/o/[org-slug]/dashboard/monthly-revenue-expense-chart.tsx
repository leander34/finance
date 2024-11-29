'use client'
import { dayjs, fakeDelay, moneyFormatter } from '@saas/core'
import { useQuery } from '@tanstack/react-query'
import { HelpCircle, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { getMonthlyRevenueExpenseChartHttp } from '@/http/charts/get-monthly-revenue-expense-chart-http'
import { cn } from '@/lib/utils'

const chartConfig = {
  totalAmountOfExpense: {
    label: 'Despesas',
    color: 'hsl(var(--chart-expense))',
  },
  totalAmountOfRevenue: {
    label: 'Receitas',
    color: 'hsl(var(--chart-revenue))',
  },
} satisfies ChartConfig
export function MonthlyRevenueExpenseChart() {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  const [selectedYear, setSelectedYear] = useState(dayjs().format('YYYY'))
  const [onlyPaidTransactions, setOnlyPaidTransactions] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: [
      'primary',
      'monthly-revenue-expense-chart',
      selectedYear,
      onlyPaidTransactions,
      currentOrg,
    ],
    queryFn: async () => {
      // await fakeDelay(3000)
      return getMonthlyRevenueExpenseChartHttp({
        slug: currentOrg,
        year: Number(selectedYear),
        status: onlyPaidTransactions ? ['PAID'] : ['PAID', 'UNPAID'],
        visibledInOverallBalance: true,
      })
    },
  })

  const existSomeData =
    data &&
    data.transactionsByMonth.some(
      (item) => item.amountOfExpenses > 0 || item.amountOfRevenues > 0,
    )

  return (
    <Card className={cn('col-span-3 self-start', isLoading && 'opacity-50')}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>
            Receitas <span className="text-xs text-muted-foreground">x</span>{' '}
            Despesas
          </CardTitle>
          <CardDescription>Janeiro - Dezembro {selectedYear}</CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Select
            disabled={isLoading}
            value={selectedYear}
            onValueChange={setSelectedYear}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Selecione um ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Ano</SelectLabel>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
                <SelectItem value="2028">2028</SelectItem>
                <SelectItem value="2029">2029</SelectItem>
                <SelectItem value="2030">2030</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {/* <div className="flex items-center gap-2 rounded-md border p-1 px-2">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip delayDuration={0} disableHoverableContent>
                  <TooltipTrigger type="button">
                    <HelpCircle className="text-muted-foregroun size-4 shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Apenas despesas que já foram pagas por você e receitas já
                    recebidas por você.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-muted-foregrounds text-[0.8rem] leading-none">
                Filtrar apenas pelas despesas e receitas efetivadas
              </span>{' '}
            </div>
            <Switch
              checked={onlyPaidTransactions}
              onCheckedChange={setOnlyPaidTransactions}
              disabled={isLoading}
            />
          </div> */}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[360px] items-center justify-center rounded-xl border bg-primary-foreground shadow-sm">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : existSomeData ? (
          <ChartContainer config={chartConfig} className="max-h-[350px] w-full">
            <BarChart accessibilityLayer data={data.transactionsByMonth}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => {
                  const shortMonth = dayjs().set('month', value).format('MMM')
                  return shortMonth
                    .slice(0, 1)
                    .toUpperCase()
                    .concat(shortMonth.slice(1))
                }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickCount={6}
                width={100}
                tickFormatter={(value) => moneyFormatter(value)}
              />
              <ChartTooltip
                cursor={true}
                labelFormatter={(_, payload) => {
                  const month = payload[0].payload.month
                  const date = dayjs()
                    .set('year', Number(selectedYear))
                    .set('month', month)
                  const fullNameOfTheMonth = date.format('MMMM')
                  const formattedMonthName = fullNameOfTheMonth
                    .slice(0, 1)
                    .toUpperCase()
                    .concat(fullNameOfTheMonth.slice(1))
                  const formattedDate = `${formattedMonthName}, ${date.year()}`
                  return formattedDate
                }}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value, name, data, index) => (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex min-w-[130px] items-center gap-2 text-xs text-muted-foreground">
                          <span
                            style={{
                              backgroundColor:
                                chartConfig[name as keyof typeof chartConfig]
                                  ?.color,
                            }}
                            className="h-3 w-3 rounded-sm"
                          />
                          {chartConfig[name as keyof typeof chartConfig]
                            ?.label || name}
                          <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                            {moneyFormatter(Number(value))}
                          </div>
                        </div>
                        {index === 1 && (
                          <div className="flex items-center gap-1 border-t pt-1.5 text-muted-foreground">
                            <span>Balanço: </span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                              {moneyFormatter(data.payload.balance)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="totalAmountOfExpense"
                fill="var(--color-totalAmountOfExpense)"
                radius={4}
              />
              <Bar
                dataKey="totalAmountOfRevenue"
                fill="var(--color-totalAmountOfRevenue)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[260px] items-center justify-center">
            <span className="text-sm text-muted-foreground">
              Nenhum dado encontrado nesse período.
            </span>
          </div>
        )}
      </CardContent>
      {/* <CardFooter>
        <div className="flex w-full flex-row items-center gap-2 space-y-0 rounded-md border p-3 shadow-sm">
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
            <span className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Ignorar essa transação?
            </span>
            <span className="block text-[0.8rem] leading-none text-muted-foreground">
              Ignore essa transação para ela não ser includa na soma da tela
              inicial.
            </span>
          </div>
          <Switch
            className="ml-auto"
            // disabled={isDisabled}
            // checked={field.value}
            // onCheckedChange={field.onChange}
          />
        </div>
      </CardFooter> */}
    </Card>
  )
}
