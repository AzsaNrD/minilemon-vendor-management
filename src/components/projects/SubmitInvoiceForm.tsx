'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { FileUpload } from '@/components/ui/FileUpload'
import { useToast } from '@/components/ui/Toast'
import { submitInvoice } from '@/actions/invoice'

export function SubmitInvoiceForm({ projectId }: { projectId: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [driveLink, setDriveLink] = useState('')
  const [notes, setNotes] = useState('')
  const [signature, setSignature] = useState<{ fileKey?: string; previewUrl?: string }>({})
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setErrors({})
    if (!signature.fileKey) {
      setErrors({ signatureFileKey: ['Tanda tangan wajib'] })
      return
    }
    startTransition(async () => {
      const result = await submitInvoice(projectId, {
        deliverableDriveLink: driveLink.trim(),
        notes: notes.trim() || undefined,
        signatureFileKey: signature.fileKey,
      })
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors)
        showToast(result.error, 'error')
        return
      }
      showToast('Invoice terkirim', 'success', 'Menunggu approval admin.')
      router.push(`/projects/${projectId}?tab=invoice`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <Input
        type="url"
        label="Tautan Deliverable (Google Drive / lainnya)"
        placeholder="https://drive.google.com/..."
        required
        value={driveLink}
        onChange={(e) => setDriveLink(e.target.value)}
        error={errors.deliverableDriveLink?.[0]}
        hint="Pastikan tautan dapat diakses oleh admin Minilemon"
      />
      <Textarea
        label="Catatan (opsional)"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="cth. Final files termasuk source files dan thumbnail..."
      />
      <FileUpload
        kind="SIGNATURE"
        label="Tanda Tangan"
        hint="PNG/JPG, maksimal 1MB"
        maxSizeLabel="PNG atau JPG, maksimal 1MB"
        required
        value={signature}
        onChange={(val) => setSignature(val ?? {})}
      />
      {errors.signatureFileKey?.[0] && <p className="text-xs text-coral-600">{errors.signatureFileKey[0]}</p>}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSubmit} loading={isPending}>
          Submit Invoice
        </Button>
      </div>
    </div>
  )
}
