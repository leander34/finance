import { toast } from 'sonner'

import { Button } from '../ui/button'
import { Icons } from '../ui/icons'

export function Google() {
  return (
    <Button
      variant="outline"
      type="button"
      // disabled={isSending}
      className="flex-1"
      onClick={() => {
        toast.error('Indiponível no momento', {
          description:
            'No momento entrar com o google está em desenvolvimento.',
        })
      }}
    >
      <Icons.google className="mr-2 h-4 w-4" />
      Google
    </Button>
  )
}
