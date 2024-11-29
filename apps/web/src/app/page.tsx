import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex items-center gap-4">
        <Button asChild>
          <Link href="/sign-up?plan=free">Plano Free</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up?plan=premium-mensal">Plano Premium Mensal</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up?plan=premium-anual">Plano Premium Anual</Link>
        </Button>
      </div>
    </div>
  )
}
