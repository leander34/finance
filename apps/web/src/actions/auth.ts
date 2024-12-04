'use server'

import { phoneValidator, PLAN_NAMES, type PlanNamesType } from '@saas/core'
import { env } from '@saas/env'
import { HTTPError } from 'ky'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createSession, deleteSession } from '@/auth/session-server-only'
import { signInHttp, type SignInHttpResponse } from '@/http/auth/sign-in-http'
import { signUpHttp, type SignUpHttpResponse } from '@/http/auth/sign-up-http'
import { updateSubscriptionOnBillingPortalHttp } from '@/http/auth/user/update-subscription-on-billing-portal-http'

const signUpFormSchema = z.object({
  name: z
    .string({ required_error: 'O campo nome é obrigatório.' })
    .refine((value) => value.trim().split(' ').length >= 2, {
      message: 'Digite o seu nome completo.',
    }),
  // document: z
  //   .string({ required_error: 'O campo CPF/CNPJ é obrigatório.' })
  //   .refine(
  //     (value) => {
  //       return value.replace(/[^\d]+/g, '').length === 11
  //     },
  //     { message: 'Documento inválido.' },
  //   )
  //   .refine(
  //     (value) => {
  //       return !(value.replace(/[^\d]+/g, '').length > 14)
  //     },
  //     { message: 'Documento inválido.' },
  //   )
  //   .refine((value) => documentValidator(value), {
  //     message: 'Documento inválido.',
  //   })
  //   .transform((value) => value.replace(/[^\d]+/g, '')),
  phone: z
    .string({
      required_error: 'O campo número do telefone é obrigatório.',
    })
    .transform((value) => value.replace(/[^\d]+/g, ''))
    .refine((value) => phoneValidator(value), {
      message:
        'Número de telefone inválido. Lembre-se de colocar o dígito 9 e o DDD.',
    }),
  email: z
    .string({ required_error: 'O campo e-mail é obrigatório.' })
    .email({ message: 'E-mail inválido.' }),
  password: z
    .string({ required_error: 'O campo senha é obrigatório.' })
    .min(6, {
      message: 'Senha inválida. Sua senha deve conter pelo menos 6 caracteres.',
    }),
  plan: z
    .nativeEnum(PLAN_NAMES)
    .or(z.literal(''))
    .transform((value) => (value === '' ? null : (value as PlanNamesType))),
})

const signInFormSchema = z.object({
  email: z
    .string({ required_error: 'O campo e-mail é obrigatório.' })
    .email({ message: 'E-mail inválido.' }),
  password: z
    .string({ required_error: 'O campo senha é obrigatório.' })
    .min(6, {
      message: 'Senha inválida. Sua senha deve conter pelo menos 6 caracteres.',
    }),
})
export async function signUpWithPasswordAction(formData: FormData) {
  // console.log(Object.fromEntries(formData))
  const result = signUpFormSchema.safeParse(Object.fromEntries(formData))
  console.log(Object.fromEntries(formData))
  // console.log(result.error)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    console.log(errors)
    return {
      success: false,
      message: null,
      errors,
    }
  }

  // console.log(result.data)

  const { name, email, password, plan, phone } = result.data

  let response: SignUpHttpResponse
  let redirectApp = '/planos'
  try {
    // chamar o meu api
    response = await signUpHttp({
      name,
      email,
      password,
      phone,
    })
    // // criar a sessão
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json()
      return { success: false, message, errors: null }
    }
    return {
      success: false,
      message: 'Erro inesperado, tente novamente em alguns minutos.',
      errors: null,
    }
  }
  const {
    accessToken,
    organization: { slug },
  } = response

  // await createSession(accessToken, slug, redirectApp)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 dias

  cookies().set('access_token', accessToken, {
    // httpOnly: true,
    // secure: true,
    expires: expiresAt,
    // sameSite: 'lax',
    path: '/',
  })

  cookies().set('organization', slug, {
    // httpOnly: true,
    // secure: true,
    expires: expiresAt,
    // sameSite: 'lax',
    path: '/',
  })
  //

  try {
    if (plan === 'MONTHLY_PREMIUM' || plan === 'YEARLY_PREMIUM') {
      const returnUrlStripe = `${env.NEXT_PUBLIC_URL}/o/${slug}/dashboard`
      const returnSuccessUpdateUrlStripe = `${env.NEXT_PUBLIC_URL}/o/${slug}/dashboard?sup=true`
      const { url } = await updateSubscriptionOnBillingPortalHttp({
        updateToPlan: plan,
        returnUrl: returnUrlStripe,
        returnSuccessUpdateUrl: returnSuccessUpdateUrlStripe,
      })
      redirectApp = url
    }
  } catch (error) {}
  redirect(redirectApp)
}

// export function signInWithGoogle(formData: FormData) {}

export async function signInWithPasswordAction(formData: FormData) {
  const result = signInFormSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return { success: false, message: null, errors }
  }

  const { email, password } = result.data
  let response: SignInHttpResponse
  try {
    response = await signInHttp({ email, password })
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json()
      return { success: false, message, errors: null }
    }
    return {
      success: false,
      message: 'Erro inesperado, tente novamente em alguns minutos.',
      errors: null,
    }
  }
  const {
    accessToken,
    organization: { slug },
  } = response
  await createSession(accessToken, slug)
}

export async function signOut() {
  deleteSession()
}
