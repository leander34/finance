import { ForgotPasswordForm } from './forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <div className="grid h-full lg:grid-cols-2">
      <div className="hidden rounded-r-lg bg-primary p-4 shadow-[20px_0px_60px_4px_rgba(0,0,0,0.1)] lg:block">
        <h1 className="text-3xl text-muted">Finance.</h1>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
