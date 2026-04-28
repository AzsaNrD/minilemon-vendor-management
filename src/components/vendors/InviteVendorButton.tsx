'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { inviteVendor } from '@/actions/vendors'

export function InviteVendorButton() {
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()

  function handleSubmit(formData: FormData) {
    setErrors({})
    const input = {
      fullName: String(formData.get('fullName') || ''),
      email: String(formData.get('email') || ''),
      message: String(formData.get('message') || '') || undefined,
    }

    startTransition(async () => {
      const result = await inviteVendor(input)
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors)
        showToast(result.error, 'error')
        return
      }
      showToast('Undangan terkirim', 'success', 'Vendor menerima email dengan kredensial sementara.')
      setOpen(false)
    })
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Undang Vendor
      </Button>
      <Modal
        open={open}
        onClose={() => !isPending && setOpen(false)}
        title="Undang Vendor Baru"
        description="Vendor akan menerima email berisi kredensial sementara untuk login pertama."
      >
        <form action={handleSubmit} className="space-y-4">
          <Input
            name="fullName"
            label="Nama Lengkap"
            placeholder="cth. Andika Pratama"
            required
            error={errors.fullName?.[0]}
          />
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="vendor@email.com"
            required
            error={errors.email?.[0]}
          />
          <Textarea
            name="message"
            label="Pesan (opsional)"
            placeholder="Sambutan singkat..."
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" loading={isPending}>
              Kirim Undangan
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
