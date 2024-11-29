import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordForm() {
  return (
    <div className="relative flex flex-col items-center justify-center px-4">
      <Button
        variant="ghost"
        className="absolute right-8 top-4 mt-1 self-end text-sm"
      >
        <Link href="/sign-in">Entrar na minha conta</Link>
      </Button>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center">
          <h1 className="text-center text-2xl font-medium">
            Esqueceu sua senha?
          </h1>
          <p className="max-w-80 text-center text-sm text-muted-foreground">
            Não se preocupe, vamos enviar um código de recuperação para o seu
            e-mail.
          </p>
        </div>
        <form action="" className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="email" className="">
              E-mail
            </Label>
            <Input type="email" id="email" placeholder="example@email.com" />
          </div>

          <div className="flex flex-col">
            <Button className="mt-4 w-full">
              Enviar código de recuperação
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
