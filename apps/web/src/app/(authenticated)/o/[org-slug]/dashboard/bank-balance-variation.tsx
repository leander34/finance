'use client'

import { dayjs, moneyFormatter } from '@saas/core'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp } from 'lucide-react'
import { useParams } from 'next/navigation'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

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
import { getCashFlowChartHttp } from '@/http/charts/get-cash-flow-chart'

const chartConfig = {
  amount: {
    label: 'Saldo previsto do dia',
    color: 'hsl(var(--chart-cash-flow))',
  },
} satisfies ChartConfig

export function BankBalanceVariantion() {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  const { data } = useQuery({
    queryKey: ['primary', 'cash-flow-chart', currentOrg],
    queryFn: async () => {
      // await fakeDelay(3000)
      return getCashFlowChartHttp({
        slug: currentOrg,
        visibledInOverallBalance: true,
      })
    },
  })
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Line Chart - Linear</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={data?.cashFlowData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => dayjs(value).format('DD [de] MMM')}
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
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(label) =>
                    dayjs(label).format('DD [de] MMMM, YYYY')
                  }
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
                        {chartConfig[name as keyof typeof chartConfig]?.label ||
                          name}
                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                          {moneyFormatter(Number(value))}
                        </div>
                      </div>
                      {index === 0 && (
                        <div className="flex items-center gap-1 border-t pt-1.5 text-muted-foreground">
                          <span>Quantidade de transações: </span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {data.payload.amountOfTransactions}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="amount"
              type="linear"
              stroke="var(--color-amount)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}

export function AreaVariant() {
  const { 'org-slug': currentOrg } = useParams<{
    'org-slug': string
  }>()
  const { data } = useQuery({
    queryKey: ['primary', 'cash-flow-chart', currentOrg],
    queryFn: async () => {
      // await fakeDelay(3000)
      return getCashFlowChartHttp({
        slug: currentOrg,
        visibledInOverallBalance: true,
      })
    },
  })
  return (
    <Card className="col-span-4 self-start">
      <CardHeader>
        <CardTitle>Fluxo de caixa</CardTitle>
        <CardDescription>
          Gráfico de fluxo de caixa previsto em um período de 31 dias.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[350px] w-full">
          <AreaChart
            accessibilityLayer
            data={data?.cashFlowData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => dayjs(value).format('DD [de] MMM')}
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
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(label) =>
                    dayjs(label).format('DD [de] MMMM, YYYY')
                  }
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
                        {chartConfig[name as keyof typeof chartConfig]?.label ||
                          name}
                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                          {moneyFormatter(Number(value))}
                        </div>
                      </div>
                      {index === 0 && (
                        <div className="flex items-center gap-1 border-t pt-1.5 text-muted-foreground">
                          <span>Quantidade de transações: </span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {data.payload.amountOfTransactions}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />

            <Area
              dataKey="amount"
              type="linear"
              fill="var(--color-amount)"
              fillOpacity={0.4}
              stroke="var(--color-amount)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter> */}
    </Card>
  )
}
