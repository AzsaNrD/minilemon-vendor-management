'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { FileUpload } from '@/components/ui/FileUpload'
import { useToast } from '@/components/ui/Toast'
import { setMasterSignature } from '@/actions/settings'

export function MasterSignatureForm({
  currentFileKey,
  currentUrl,
}: {
  currentFileKey?: string
  currentUrl?: string
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const [signature, setSignature] = useState<{ fileKey?: string; previewUrl?: string }>({
    fileKey: currentFileKey,
    previewUrl: currentUrl,
  })
  const [dirty, setDirty] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (!signature.fileKey) return
    startTransition(async () => {
      const result = await setMasterSignature({ signatureFileKey: signature.fileKey })
      if (!result.ok) {
        showToast(result.error, 'error')
        return
      }
      showToast('Master signature tersimpan', 'success')
      setDirty(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <FileUpload
        kind="SIGNATURE"
        label="Tanda tangan admin"
        hint="PNG dengan latar transparan disarankan, maksimal 1MB"
        maxSizeLabel="PNG/JPG, maksimal 1MB"
        value={signature}
        onChange={(val) => {
          setSignature(val ?? {})
          setDirty(true)
        }}
      />
      {dirty && (
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={isPending} disabled={!signature.fileKey}>
            Simpan Signature
          </Button>
        </div>
      )}
    </div>
  )
}
