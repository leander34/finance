'use client'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

import { signInWithPasswordAction } from '@/actions/auth'
import * as SocialLogin from '@/components/auth/social-login'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { customUseFormState } from '@/hooks/custom-use-form-state'

export function SignInForm() {
  const [formState, handleSubmit, isPending] = customUseFormState(
    signInWithPasswordAction,
  )
  // console.log(formState)
  const { success, errors, message } = formState

  return (
    <div className="relative flex flex-col items-center justify-center px-4">
      <Button
        variant="ghost"
        className="absolute right-8 top-4 mt-1 self-end text-sm"
      >
        <Link href="/sign-up">Criar conta gratuitamente</Link>
      </Button>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center">
          <h1 className="text-center text-2xl font-medium">
            Bem-vindo de volta
          </h1>
          <p className="max-w-80 text-center text-sm text-muted-foreground">
            Cuidade do dinheiro e ele transformará sua vida.
          </p>
        </div>
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
            <Link
              href="/forgot-password"
              className="self-end text-sm text-blue-600"
            >
              Esqueci minha senha
            </Link>
          </div>
          <div className="flex flex-col">
            <Button type="submit" className="mt-4 w-full" disabled={isPending}>
              {isPending && (
                <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
              )}
              Entrar na conta
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

// function Status() {
//   const status = useFormStatus()
//   const { data } = status
//   return (
//     <div>
//       {JSON.stringify(status, null, 2)} {data?.get('email')}
//     </div>
//   )
// }
