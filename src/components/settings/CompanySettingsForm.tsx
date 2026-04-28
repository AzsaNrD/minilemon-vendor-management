'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { updateCompanySettings } from '@/actions/settings'
import type { UpdateCompanyInput } from '@/schemas/settings'

export function CompanySettingsForm({ initial }: { initial: UpdateCompanyInput }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setErrors({})
    const input = {
      name: String(formData.get('name') || ''),
      address: String(formData.get('address') || ''),
      phone: String(formData.get('phone') || ''),
      email: String(formData.get('email') || ''),
      directorName: String(formData.get('directorName') || ''),
      directorTitle: String(formData.get('directorTitle') || ''),
    }
    startTransition(async () => {
      const result = await updateCompanySettings(input)
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors)
        showToast(result.error, 'error')
        return
      }
      showToast('Pengaturan perusahaan tersimpan', 'success')
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input name="name" label="Nama Perusahaan" required defaultValue={initial.name} error={errors.name?.[0]} />
      <Textarea
        name="address"
        label="Alamat"
        rows={3}
        required
        defaultValue={initial.address}
        error={errors.address?.[0]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          name="phone"
          label="Telepon"
          required
          defaultValue={initial.phone}
          error={errors.phone?.[0]}
        />
        <Input
          name="email"
          type="email"
          label="Email"
          required
          defaultValue={initial.email}
          error={errors.email?.[0]}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          name="directorName"
          label="Nama Direktur"
          required
          defaultValue={initial.directorName}
          error={errors.directorName?.[0]}
        />
        <Input
          name="directorTitle"
          label="Jabatan"
          required
          defaultValue={initial.directorTitle}
          error={errors.directorTitle?.[0]}
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isPending}>
          Simpan Pengaturan
        </Button>
      </div>
    </form>
  )
}
