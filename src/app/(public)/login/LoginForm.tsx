'use client'

import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

interface Props {
  initialError?: string
}

export function LoginForm({ initialError }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [error, setError] = useState<string | undefined>(initialError)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')
    setError(undefined)

    startTransition(async () => {
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) {
        setError('Email atau password salah.')
        showToast('Login gagal', 'error', 'Periksa kembali kredensial Anda.')
        return
      }
      router.replace('/')
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input name="email" type="email" label="Email" placeholder="nama@email.com" required autoComplete="email" />
      <Input name="password" type="password" label="Password" required autoComplete="current-password" />
      {error && (
        <div className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-600">{error}</div>
      )}
      <Button type="submit" loading={isPending} className="w-full">
        Masuk
      </Button>
    </form>
  )
}
