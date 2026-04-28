'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Download, Pen } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DocStatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { FileUpload } from '@/components/ui/FileUpload'
import { useToast } from '@/components/ui/Toast'
import { vendorSignSPK } from '@/actions/spk'
import { formatDate } from '@/lib/utils'
import type { SPK } from '@prisma/client'

export function SPKTabVendor({ spk }: { spk: SPK | null }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [signing, setSigning] = useState(false)
  const [signature, setSignature] = useState<{ fileKey?: string; previewUrl?: string }>({})
  const [isPending, startTransition] = useTransition()

  if (!spk) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-sm text-ink-500 italic">SPK belum tersedia.</p>
        </CardBody>
      </Card>
    )
  }

  function handleSign() {
    if (!signature.fileKey || !spk) return
    startTransition(async () => {
      const result = await vendorSignSPK(spk.id, { signatureFileKey: signature.fileKey })
      if (!result.ok) {
        showToast(result.error, 'error')
        return
      }
      showToast('SPK ditandatangani', 'success', 'Project sekarang dalam progress.')
      setSigning(false)
      setSignature({})
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">SPK</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm">{spk.docNumber}</span>
              <DocStatusBadge status={spk.status} />
            </div>
            <p className="text-xs text-ink-500 mt-2">
              Periode: {formatDate(spk.periodStart)} &mdash; {formatDate(spk.periodEnd)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(spk.status === 'DRAFT' || spk.status === 'PENDING_ADMIN_SIGN') && (
              <p className="text-sm text-ink-500 italic">Menunggu admin lengkapi & TTD SPK</p>
            )}
            {spk.status === 'PENDING_VENDOR_SIGN' && (
              <Button onClick={() => setSigning(true)}>
                <Pen className="h-4 w-4" /> TTD SPK
              </Button>
            )}
            {spk.status === 'SIGNED' && (
              <>
                <span className="inline-flex items-center gap-1.5 text-sm text-leaf-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Aktif
                </span>
                <a href={`/api/documents/spk/${spk.id}/pdf`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                </a>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      <Modal
        open={signing}
        onClose={() => !isPending && setSigning(false)}
        title="TTD SPK"
        description="Setelah TTD, project akan masuk ke fase pengerjaan."
      >
        <div className="space-y-3">
          <FileUpload
            kind="SIGNATURE"
            label="Tanda tangan"
            hint="PNG/JPG, maksimal 1MB"
            maxSizeLabel="PNG atau JPG, maksimal 1MB"
            value={signature}
            onChange={(val) => setSignature(val ?? {})}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setSigning(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={handleSign} loading={isPending} disabled={!signature.fileKey}>
              TTD &amp; Mulai Pengerjaan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
