'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { FileUpload } from '@/components/ui/FileUpload'
import { useToast } from '@/components/ui/Toast'
import { vendorSignNDA } from '@/actions/nda'

export function NDASignPanel({ ndaId, vendorName }: { ndaId: string; vendorName: string }) {
  const router = useRouter()
  const { update } = useSession()
  const { showToast } = useToast()
  const [signature, setSignature] = useState<{ fileKey?: string; previewUrl?: string }>({})
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  const canSubmit = !!signature.fileKey && agreed && !isPending

  function handleSubmit() {
    if (!signature.fileKey) return
    setError(undefined)
    startTransition(async () => {
      const result = await vendorSignNDA({
        signatureFileKey: signature.fileKey,
        agreed: true,
      })
      if (!result.ok) {
        setError(result.error)
        showToast(result.error, 'error')
        return
      }
      showToast('NDA berhasil ditandatangani', 'success', 'Menunggu approval dari admin.')
      await update({ vendorStatus: 'PENDING_ADMIN_SIGN' })
      router.refresh()
    })
  }

  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900">Tanda Tangan NDA</h2>
          <p className="text-xs text-ink-500 mt-0.5">
            Atas nama <strong>{vendorName}</strong>
          </p>
        </div>

        <FileUpload
          kind="SIGNATURE"
          label="Unggah tanda tangan"
          hint="PNG/JPG transparan, maksimal 1MB"
          maxSizeLabel="PNG/JPG, maksimal 1MB"
          required
          value={signature}
          onChange={(val) => setSignature(val ?? {})}
        />

        <label className="flex items-start gap-2 text-sm text-ink-700 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-ink-300 text-ink-900 focus:ring-lemon-400"
          />
          <span>
            Saya telah membaca dan menyetujui seluruh ketentuan dalam NDA. Saya memahami bahwa tanda tangan
            elektronik ini memiliki kekuatan hukum yang sama dengan tanda tangan basah.
          </span>
        </label>

        {error && <div className="rounded-lg bg-coral-50 px-3 py-2 text-xs text-coral-600">{error}</div>}

        <Button onClick={handleSubmit} disabled={!canSubmit} loading={isPending} className="w-full">
          TTD &amp; Submit
        </Button>
      </CardBody>
    </Card>
  )
}
