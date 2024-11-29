'use client'
import type { ReactNode } from 'react'

import { Toaster } from '@/components/ui/sonner'

import { AuthContextProvider } from './auth-provider'
import { ProgressBar } from './progress-bar'
import { ReactQueryProvider } from './react-query'
import { ThemeProvider } from './theme-provider'
interface ProvidersProps {
  children: ReactNode
}
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ReactQueryProvider>
        <AuthContextProvider>{children}</AuthContextProvider>
        <Toaster position="top-center" />
        <ProgressBar />
      </ReactQueryProvider>
    </ThemeProvider>
  )
}
