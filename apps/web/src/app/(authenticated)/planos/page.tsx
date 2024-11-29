import { redirect } from 'next/navigation'

import {
  getCurrentOrganizationSlug,
  getUserProfileServer,
} from '@/auth/session-server-only'
import { DifferenceBetweenPlansTable } from '@/components/difference-between-plans-table'

import { MoreAboutPlans } from './more-about-plans'
import { PlansForm } from './plans-form'
export default async function PlanosPage() {
  const orgSlug = getCurrentOrganizationSlug() // transformar

  // se não tiver currentOrg procurar a personal do usuário

  // verficar se pode entrar nessa página primeiro login (ADMIN) e se é premium

  const { user } = await getUserProfileServer()

  if (user.firstLogin === false) {
    redirect(`/o/${orgSlug}/dashboard`)
  }

  if (user.subscription.resolvedActivePlan === 'PREMIUM') {
    redirect(`/o/${orgSlug}/dashboard`)
  }

  return (
    <div className="flex flex-col">
      <div className="px-6 py-4">
        <span className="text-3xl font-semibold antialiased">Finance.</span>
      </div>

      <main className="mx-auto my-24 w-full max-w-[1280px] flex-1 space-y-28 px-6">
        <div className="flex justify-between gap-52">
          <div className="flex-1 space-y-1">
            <h2 className="font-medium uppercase tracking-wide">
              Bem vindo ao Finance, Leander!
            </h2>
            <h1 className="text-3xl font-semibold">Selecione o seu plano</h1>
            <p className="text-sm font-medium text-muted-foreground">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nemo ex
              excepturi minima ad dolorum consectetur molestiae non iure
              reiciendis nostrum deleniti, consequatur eaque temporibus
              voluptatem omnis harum debitis enim itaque?
            </p>
            <MoreAboutPlans />
          </div>
          <PlansForm currentOrg={orgSlug} />
        </div>
        {/*  */}
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-center text-3xl font-semibold">
              {' '}
              Lorem ipsum dolor sit amet consectetur
            </h3>
            <p className="max-w-lg text-center text-sm font-medium text-muted-foreground">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Asperiores nihil est velit atque. Dolorem doloribus, ducimus rem
              accusamus aliquid molestiae.
            </p>
          </div>
          <DifferenceBetweenPlansTable />
          Carroseul
        </div>
      </main>
      <footer className="flex h-40 items-end bg-primary px-6 py-4 text-primary-foreground">
        <div>
          <span>Inv.</span>
          <span>Copyright &copy; 2024 Finance Inc.</span>
        </div>
        {/* <div>
          <Link href='/termos-de-servico'>Termos de serviço</Link>
          <Link href='/politica-de-privacidade'>Politicas de privacidade</Link>
        </div> */}
      </footer>
      {/* <BackgroundBeams /> */}
    </div>
  )
}
