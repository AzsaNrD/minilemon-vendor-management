'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { changePassword } from '@/actions/auth'
import { useToast } from '@/components/ui/Toast'

export function FirstLoginForm() {
  const router = useRouter()
  const { update } = useSession()
  const { showToast } = useToast()
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(undefined)
    const currentPassword = String(formData.get('currentPassword') || '')
    const newPassword = String(formData.get('newPassword') || '')
    const confirm = String(formData.get('confirm') || '')

    if (newPassword !== confirm) {
      setError('Konfirmasi password tidak cocok')
      return
    }

    startTransition(async () => {
      const result = await changePassword({ currentPassword, newPassword })
      if (!result.ok) {
        setError(result.error)
        return
      }
      await update({ mustChangePassword: false })
      showToast('Password diperbarui', 'success')
      router.replace('/')
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input
        name="currentPassword"
        type="password"
        label="Password sementara"
        hint="Password yang Anda terima via email"
        required
      />
      <Input name="newPassword" type="password" label="Password baru" required minLength={8} />
      <Input name="confirm" type="password" label="Konfirmasi password baru" required minLength={8} />
      {error && <div className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-600">{error}</div>}
      <Button type="submit" loading={isPending} className="w-full">
        Simpan & Lanjutkan
      </Button>
    </form>
  )
}
