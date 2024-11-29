'use client'
import { useState } from 'react'

import { CreateOrUpdateFinancialAccountModal } from '@/components/global/create-or-update-financial-account-modal'
import { Button } from '@/components/ui/button'

export function FinancialAccountModalWrapper() {
  const [showFinancialAccountModal, setShowFinancialAccountModal] =
    useState(false)
  return (
    <>
      <Button
        type="button"
        onClick={() => setShowFinancialAccountModal(true)}
        variant="default"
        font="xsm"
      >
        Adicionar nova conta
      </Button>
      <CreateOrUpdateFinancialAccountModal
        open={showFinancialAccountModal}
        handleOpenChangeModal={setShowFinancialAccountModal}
      />
    </>
  )
}
