'use client'
import { useState } from 'react'

import { CreateOrUpdateCreditCardModal } from '@/components/global/create-or-update-credit-card-modal'
import { Button } from '@/components/ui/button'

export function CreditCardModalWrapper() {
  const [showCreditCardModal, setShowCreditCardModal] = useState(false)
  return (
    <>
      <Button
        type="button"
        onClick={() => setShowCreditCardModal(true)}
        variant="default"
        font="xsm"
      >
        Adicionar novo cartão
      </Button>
      <CreateOrUpdateCreditCardModal
        open={showCreditCardModal}
        handleOpenChangeModal={setShowCreditCardModal}
      />
    </>
  )
}
