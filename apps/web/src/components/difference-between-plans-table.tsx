'use client'
import { CircleCheckBig, CircleX, Info } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { functionalities } from '@/plan/functionalities'
export function DifferenceBetweenPlansTable() {
  return (
    <Table>
      <TableCaption>Lista de funcionalidades por plano.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[260px]">Funcionalidades</TableHead>
          <TableHead className="w-[70px]"></TableHead>
          <TableHead className="text-center">Free (R$ 0)</TableHead>
          <TableHead className="text-center">
            Premium mensal (R$ 11,90/mês)
          </TableHead>
          <TableHead className="text-center">
            Premium anual (R$ 109,90/ano)
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {functionalities.map((functionality) => {
          return (
            <TableRow key={functionality.name}>
              <TableCell className="font-medium">
                {functionality.name}
              </TableCell>
              <TableCell className="font-medium">
                <TooltipProvider>
                  <Tooltip delayDuration={0} disableHoverableContent>
                    <TooltipTrigger asChild>
                      <Info className="size-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>{functionality.info}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  {functionality.type === 'icon' ? (
                    functionality.free ? (
                      <CircleCheckBig className="size-5 text-green-500" />
                    ) : (
                      <CircleX className="size-5 text-destructive" />
                    )
                  ) : (
                    functionality.free
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  {functionality.type === 'icon' ? (
                    functionality.premiumMensal ? (
                      <CircleCheckBig className="size-5 text-green-500" />
                    ) : (
                      <CircleX className="size-5 text-destructive" />
                    )
                  ) : (
                    functionality.premiumMensal
                  )}
                </div>
              </TableCell>
              <TableCell className="">
                <div className="flex justify-center">
                  {functionality.type === 'icon' ? (
                    functionality.premiumAnual ? (
                      <CircleCheckBig className="size-5 text-green-500" />
                    ) : (
                      <CircleX className="size-5 text-destructive" />
                    )
                  ) : (
                    functionality.premiumAnual
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
