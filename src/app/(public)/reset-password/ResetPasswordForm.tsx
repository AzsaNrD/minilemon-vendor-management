'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { resetPassword } from '@/actions/auth'
import { useToast } from '@/components/ui/Toast'

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(undefined)
    const newPassword = String(formData.get('newPassword') || '')
    const confirm = String(formData.get('confirm') || '')

    if (newPassword !== confirm) {
      setError('Konfirmasi password tidak cocok')
      return
    }

    startTransition(async () => {
      const result = await resetPassword({ token, email, newPassword })
      if (!result.ok) {
        setError(result.error)
        return
      }
      showToast('Password berhasil diubah', 'success', 'Silakan login kembali.')
      router.replace('/login')
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input name="newPassword" type="password" label="Password baru" required minLength={8} />
      <Input name="confirm" type="password" label="Konfirmasi password" required minLength={8} />
      {error && <div className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-600">{error}</div>}
      <Button type="submit" loading={isPending} className="w-full">
        Simpan Password
      </Button>
    </form>
  )
}
