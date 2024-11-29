/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FormEvent, useState, useTransition } from 'react'

interface FormState {
  success: boolean
  message: string | null
  errors: Record<string, string[]> | null
}
type Action<A> = (data: A) => Promise<FormState | undefined>

const defaultInitialState = {
  success: false,
  message: null,
  errors: null,
}
export function useCustomTransition<T>(
  action: Action<T>,
  initialState?: FormState,
  onSuccess?: (data: any) => Promise<void> | void,
  onFailure?: (data: any) => Promise<void> | void,
) {
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<FormState>(
    initialState ?? defaultInitialState,
  )

  async function handleSubmit(data: T) {
    startTransition(async () => {
      const state = await action(data)
      if (state && state.success === true && onSuccess) {
        await onSuccess(state.message)
      }
      if (state && state.success === false && onFailure) {
        await onFailure(state.message)
      }
      if (state) {
        setFormState(state)
      }
    })

    // Alternativa para o redirect sem a função onSuccess
    // Como o redirect retorna void para, nossa funções action()
    // vira sem valor, então dessa forma, antes de setar o state, validamos se ele realmente existe
    // startTransition(async () => {
    //   const state = await action(data)
    //   // Update only if necessary
    //   if (state) setFormState(state)
    // })

    // requestFormReset(form)
  }

  return [formState, handleSubmit, isPending] as const
}
