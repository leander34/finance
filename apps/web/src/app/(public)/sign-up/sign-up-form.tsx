'use client'
import { type PlanNamesType } from '@saas/core'
import { AlertTriangle, RocketIcon } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { signUpWithPasswordAction } from '@/actions/auth'
import * as SocialLogin from '@/components/auth/social-login'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCustomFormState } from '@/hooks/use-custom-form-state'
export function SignUpForm() {
  const [formState, handleSubmit, isPending] = useCustomFormState(
    signUpWithPasswordAction,
  )
  const searchParams = useSearchParams()
  // console.log(formState)
  const { success, errors, message } = formState
  const plan = searchParams.get('plan')
  let selectedPlan: PlanNamesType | null = null
  if (plan === 'premium-mensal') {
    selectedPlan = 'MONTHLY_PREMIUM'
  } else if (plan === 'premium-anual') {
    selectedPlan = 'YEARLY_PREMIUM'
  }
  return (
    <div className="relative flex flex-col items-center justify-center px-4">
      <Button
        variant="ghost"
        className="absolute right-8 top-4 mt-1 self-end text-sm"
      >
        <Link href="/sign-in">Já tenho uma conta</Link>
      </Button>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center">
          <h1 className="text-center text-2xl font-medium">Criar conta</h1>
          <p className="max-w-80 text-center text-sm text-muted-foreground">
            Começar agora a cuidadar do seu dinheiro de verdade.
          </p>
        </div>
        {selectedPlan && (
          <Alert className="border-primary">
            <RocketIcon className="h-4 w-4 shrink-0 text-primary" />
            <AlertTitle>Boa escolha!</AlertTitle>
            <AlertDescription>
              <span className="">Plano escolhido</span>{' '}
              <Badge variant="plan">
                {selectedPlan === 'MONTHLY_PREMIUM' && 'Premium mensal'}
                {selectedPlan === 'YEARLY_PREMIUM' && 'Premium anual'}
              </Badge>
              <span className="block text-sm text-muted-foreground">
                Você será redirecionado para o checkout após criar sua conta.
              </span>
            </AlertDescription>
          </Alert>
        )}
        {success === false && message && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Erro ao criar conta!</AlertTitle>
            <AlertDescription>
              <p>{message}</p>
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            hidden
            name="plan"
            value={selectedPlan ?? undefined}
          />
          <div className="flex flex-col gap-1">
            <Label htmlFor="name" className="">
              Nome
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Nome completo"
              disabled={isPending}
            />
            {errors?.name && (
              <p className="text-xs font-medium text-red-500 dark:text-red-400">
                {errors.name[0]}
              </p>
            )}
          </div>
          {/* <div className="flex flex-col gap-1">
            <Label htmlFor="document" className="">
              Documento
            </Label>
            <Input
              id="document"
              name="document"
              placeholder="Nome completo"
              disabled={isPending}
            />
            {errors?.document && (
              <p className="text-xs font-medium text-red-500 dark:text-red-400">
                {errors.document[0]}
              </p>
            )}
          </div> */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="email" className="">
              E-mail
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="example@email.com"
              disabled={isPending}
            />
            {errors?.email && (
              <p className="text-xs font-medium text-red-500 dark:text-red-400">
                {errors.email[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="phone" className="">
              Telefone
            </Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              placeholder="(XX) 9XXXX-XXXX"
              // pattern="\(\d{2}\) 9\d{4}-\d{4}"
              disabled={isPending}
            />
            {errors?.phone && (
              <p className="text-xs font-medium text-red-500 dark:text-red-400">
                {errors.phone[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="password" className="">
              Senha
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Digite sua senha"
              disabled={isPending}
            />
            {errors?.password && (
              <p className="text-xs font-medium text-red-500 dark:text-red-400">
                {errors.password[0]}
              </p>
            )}
          </div>
          <div className="flex flex-col">
            <Button type="submit" className="mt-4 w-full" disabled={isPending}>
              {isPending && (
                <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
              )}
              Criar conta
            </Button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou continue com
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <SocialLogin.Google />
        </div>
      </div>
    </div>
  )
}
