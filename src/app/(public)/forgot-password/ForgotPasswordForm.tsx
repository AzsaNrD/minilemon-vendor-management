'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { forgotPassword } from '@/actions/auth'
import { CheckCircle2 } from 'lucide-react'

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await forgotPassword({ email: String(formData.get('email') || '') })
      setSubmitted(true)
    })
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-leaf-100">
          <CheckCircle2 className="h-6 w-6 text-leaf-500" />
        </div>
        <p className="mt-4 text-sm text-ink-700">
          Jika email terdaftar, tautan reset telah dikirim. Cek inbox Anda dan ikuti instruksi di email.
        </p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input name="email" type="email" label="Email" placeholder="nama@email.com" required />
      <Button type="submit" loading={isPending} className="w-full">
        Kirim Tautan Reset
      </Button>
    </form>
  )
}
