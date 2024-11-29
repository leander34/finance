'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function FinancePlanning() {
  return (
    <Card className="relative col-span-4 flex flex-col overflow-hidden">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Planejamento financeiro de agosto</CardTitle>
          <CardDescription>
            Crie um planejamento mensal para maior controle das suas finanças.
          </CardDescription>
        </div>
        <Button className="" variant="outline-hover-primary" size="sm">
          Ir para a página
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex flex-col items-center space-y-0.5">
              <span className="max-w-sm text-center font-medium leading-none tracking-tight">
                Crie um planejamento mensal para maior controle das suas
                finanças.
              </span>
              <span className="text-sm text-muted-foreground">
                Defina limites de gastor para alimentação, lazer.
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <Button variant="outline-primary" className="">
                Criar planejamento de agosto
              </Button>
              <span className="text-xs font-medium">
                Criar planejamento é um recurso premium.
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      {/* <div className="absolute inset-0 flex items-center justify-center bg-primary/30	backdrop-blur-[1px]">
            <div className="flex flex-col gap-2">
              <span className="text-xl tracking-tight">
                Esse recurso é Premium
              </span>
              <Button>Assinar agora</Button>
            </div>
          </div> */}
    </Card>
  )
}
