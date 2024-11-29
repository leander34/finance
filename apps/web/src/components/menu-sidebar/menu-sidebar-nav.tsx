'use client'
import type { PlanNamesType, ResolvedPlanNamesType } from '@saas/core'
import {
  ArrowBigUpDash,
  ArrowRightLeft,
  Bolt,
  Bookmark,
  Cable,
  Calculator,
  CalendarDays,
  CircleUserRound,
  Component,
  CreditCard,
  Landmark,
  Layers,
  LayoutDashboard,
  ListCollapse,
  MessageCircleQuestion,
  NotebookPen,
  PackageOpen,
  Split,
  SquarePlus,
  Tags,
  Target,
  Ticket,
  Unplug,
  Users,
  WalletCards,
  Workflow,
} from 'lucide-react'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { cn } from '@/lib/utils'

import { useModalPlans } from '../modal-plans'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { MenuItem } from './menu-item'
import { MenuItemGroup } from './menu-item-group'
interface MenuSidebarNavProps {
  isCollapsed?: boolean
  currentPlan: PlanNamesType
  resolvedActivePlan: ResolvedPlanNamesType
}
export function MenuSidebarNav({
  isCollapsed = false,
  resolvedActivePlan,
}: MenuSidebarNavProps) {
  const { handleToggleModalPlans } = useModalPlans()

  const isFreePlan = resolvedActivePlan === 'FREE'
  return (
    <nav
      data-collapsed={isCollapsed}
      className="group flex h-[calc(100%_-_var(--header-height))] flex-col justify-between px-2 py-2"
    >
      <div className="flex flex-col gap-1">
        {/* <Button
          variant="outline"
          className={cn(
            'mb-4 text-primary hover:text-primary',
            isCollapsed && 'h-9 w-9',
          )}
        >
          <ArrowBigUpDash
            className={cn('size-5 shrink-0', !isCollapsed && 'mr-2')}
          />
          <span className={cn('', isCollapsed && 'hidden')}>Seja Premium!</span>
        </Button> */}
        <MenuItem
          href="/dashboard"
          title="Dashboard"
          icon={LayoutDashboard}
          isCollapsed={isCollapsed}
        />

        <MenuItem
          href="/transactions"
          title="Transações"
          icon={ArrowRightLeft}
          isCollapsed={isCollapsed}
        />

        <MenuItem
          href="/contas-financeiras"
          title="Contas"
          icon={Landmark}
          isCollapsed={isCollapsed}
        />

        <MenuItem
          href="/cartoes"
          title="Cartões"
          icon={CreditCard}
          isCollapsed={isCollapsed}
        />

        <MenuItemGroup
          title="Mais opções"
          childrenHrefs={['/rede-de-amigos', '/categorias', '/tags']}
          icon={ListCollapse}
          isCollapsed={isCollapsed}
        >
          <MenuItem
            href="/cartoes"
            title="Open finance"
            icon={Component}
            // plan="Plus"
            isCollapsed={isCollapsed}
          />
          <MenuItem
            href="/rede-de-amigos"
            title="Rede de amigos"
            icon={Users}
            premium
            // plan="Plus"
            isCollapsed={isCollapsed}
          />

          <MenuItem
            href="/categorias"
            title="Categorias"
            icon={Bookmark}
            isCollapsed={isCollapsed}
          />

          <MenuItem
            href="/tags"
            title="Tags"
            icon={Tags}
            // plan="Plus"
            isCollapsed={isCollapsed}
          />

          <MenuItem
            href="/cartoes"
            title="Planejamento financeiro"
            // plan="Premium"
            premium
            icon={NotebookPen}
            isCollapsed={isCollapsed}
          />
          <MenuItem
            href="/cartoes"
            title="Objetivos"
            // plan="Premium"
            premium
            icon={Target}
            isCollapsed={isCollapsed}
          />

          <MenuItem
            href="/cartoes"
            title="Calendário"
            icon={CalendarDays}
            // plan="Plus"
            premium
            isCollapsed={isCollapsed}
          />

          <MenuItem
            href="/cartoes"
            title="Calculadora"
            icon={Calculator}
            isCollapsed={isCollapsed}
          />
          <MenuItem
            href="/cartoes"
            title="Comparação de cartões"
            icon={Split}
            // plan="Plus"
            isCollapsed={isCollapsed}
          />
        </MenuItemGroup>

        <MenuItemGroup
          title="Configurações"
          groupHref="/configuracoes"
          icon={Bolt}
          isCollapsed={isCollapsed}
        >
          <MenuItem
            href="/configuracoes/minha-conta"
            title="Minha conta"
            icon={CircleUserRound}
            isCollapsed={isCollapsed}
          />
          <MenuItem
            href="/configuracoes/assinaturas"
            title="Assinaturas"
            icon={Ticket}
            isCollapsed={isCollapsed}
          />
        </MenuItemGroup>
      </div>
      <div className="flex flex-col gap-1">
        <MenuItem
          href="/ajuda"
          title="Central de ajuda"
          icon={MessageCircleQuestion}
          isCollapsed={isCollapsed}
        />
        {isFreePlan &&
          (isCollapsed ? (
            <HoverCard openDelay={0}>
              <HoverCardTrigger asChild>
                <Button size="icon" onClick={handleToggleModalPlans}>
                  <ArrowBigUpDash className="size-4 shrink-0" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Atualizar plano</h4>
                    <p className="text-sm">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    </p>
                    <div className="flex items-center pt-2">
                      <span className="text-xs text-muted-foreground">
                        Consectetur adipisicing elit
                      </span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <Card>
              <CardHeader className="p-3">
                <CardTitle>
                  Atualize seu plano e tenha todos os benefícios da gestão
                </CardTitle>
                <CardDescription>
                  Seu plano atual é o{' '}
                  <Badge variant="secondary" className="text-primary">
                    Free
                  </Badge>
                  .{' '}
                  <span className="block">
                    <button
                      className="text-primary hover:underline"
                      onClick={handleToggleModalPlans}
                    >
                      Clique aqui
                    </button>{' '}
                    para saber todas diferenças.
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3">
                <Button className="w-full" onClick={handleToggleModalPlans}>
                  Atualizar plano
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>
    </nav>
  )
}
