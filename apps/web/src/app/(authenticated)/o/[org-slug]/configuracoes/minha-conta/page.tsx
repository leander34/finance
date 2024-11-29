import { Separator } from '@/components/ui/separator'

export default function MinhaContaPage() {
  return (
    <div className="h-full">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="lg:max-w-5xl">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque
        voluptatum enim a facere quaerat dignissimos iure debitis molestias
        soluta perferendis illo pariatur veritatis aperiam assumenda, quia qui
        et optio voluptates!
      </div>
      Minha conta
    </div>
  )
}
