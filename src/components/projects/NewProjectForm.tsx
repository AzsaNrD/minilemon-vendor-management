'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { createProject } from '@/actions/projects'

interface VendorOption {
  id: string
  fullName: string
  vendorCode: string
  category: string | null
}

export function NewProjectForm({ vendors }: { vendors: VendorOption[] }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setErrors({})
    const input = {
      name: String(formData.get('name') || ''),
      vendorId: String(formData.get('vendorId') || ''),
      brief: String(formData.get('brief') || ''),
      deadlineEstimate: String(formData.get('deadlineEstimate') || '') || undefined,
      assetDriveLink: String(formData.get('assetDriveLink') || '') || undefined,
    }
    startTransition(async () => {
      const result = await createProject(input)
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors)
        showToast(result.error, 'error')
        return
      }
      showToast('Project dibuat', 'success', 'Vendor menerima notifikasi.')
      router.push(`/admin/projects/${result.data.projectId}`)
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input
        name="name"
        label="Nama Project"
        placeholder="cth. Animasi promo Q2"
        required
        error={errors.name?.[0]}
      />
      <Select
        name="vendorId"
        label="Vendor"
        required
        error={errors.vendorId?.[0]}
        options={[
          { value: '', label: '-- Pilih vendor --' },
          ...vendors.map((v) => ({
            value: v.id,
            label: `${v.fullName} (${v.vendorCode})${v.category ? ` — ${v.category}` : ''}`,
          })),
        ]}
      />
      <Textarea
        name="brief"
        label="Brief"
        placeholder="Jelaskan scope, deliverable, gaya visual, referensi, dll."
        rows={5}
        required
        error={errors.brief?.[0]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          name="deadlineEstimate"
          type="date"
          label="Deadline Estimasi"
          hint="Opsional"
          error={errors.deadlineEstimate?.[0]}
        />
        <Input
          name="assetDriveLink"
          type="url"
          label="Asset Drive Link"
          placeholder="https://drive.google.com/..."
          hint="Opsional"
          error={errors.assetDriveLink?.[0]}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={isPending}>
          Buat Project
        </Button>
      </div>
    </form>
  )
}
