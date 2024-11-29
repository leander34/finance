'use client'
import { AppProgressBar as NProgressBar } from 'next-nprogress-bar'

export function ProgressBar() {
  return (
    <NProgressBar
      height="4px"
      color="#f97316"
      options={{ showSpinner: false }}
      shallowRouting
    />
  )
}
