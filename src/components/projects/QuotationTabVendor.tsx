'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Download, FilePlus2, Pencil } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DocStatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { FileUpload } from '@/components/ui/FileUpload'
import { useToast } from '@/components/ui/Toast'
import { vendorSignQuotation } from '@/actions/quotations'
import { formatDate, formatIDR, formatRelativeTime } from '@/lib/utils'
import type { Quotation } from '@prisma/client'

interface Props {
  projectId: string
  quotations: Quotation[]
  activeQuotation: Quotation | null
  canSubmit: boolean
}

export function QuotationTabVendor({ projectId, quotations, activeQuotation, canSubmit }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [signing, setSigning] = useState(false)
  const [signature, setSignature] = useState<{ fileKey?: string; previewUrl?: string }>({})
  const [isPending, startTransition] = useTransition()

  const showSubmitButton =
    canSubmit && (!activeQuotation || activeQuotation.status === 'REVISION_REQUESTED')

  function handleVendorSign() {
    if (!activeQuotation || !signature.fileKey) return
    startTransition(async () => {
      const result = await vendorSignQuotation(activeQuotation.id, {
        signatureFileKey: signature.fileKey,
      })
      if (!result.ok) {
        showToast(result.error, 'error')
        return
      }
      showToast('Quotation final ditandatangani', 'success', 'Tunggu admin lengkapi SPK draft.')
      setSigning(false)
      setSignature({})
      router.refresh()
    })
  }

  if (!activeQuotation && !canSubmit) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-sm text-ink-500 italic">Project belum dalam tahap quotation.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {showSubmitButton && (
        <Card>
          <CardBody className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-ink-900">
                {activeQuotation?.status === 'REVISION_REQUESTED'
                  ? 'Submit revisi quotation'
                  : 'Submit quotation'}
              </p>
              <p className="text-xs text-ink-500 mt-0.5">
                {activeQuotation?.status === 'REVISION_REQUESTED'
                  ? activeQuotation.revisionRequestNote
                  : 'Buat penawaran lengkap dengan items, PPN, dan tanggal validitas.'}
              </p>
            </div>
            <Link
              href={`/projects/${projectId}/quotation${activeQuotation?.status === 'REVISION_REQUESTED' ? `?revise=${activeQuotation.id}` : ''}`}
            >
              <Button>
                {activeQuotation?.status === 'REVISION_REQUESTED' ? (
                  <Pencil className="h-4 w-4" />
                ) : (
                  <FilePlus2 className="h-4 w-4" />
                )}
                {activeQuotation?.status === 'REVISION_REQUESTED' ? 'Submit Revisi' : 'Submit Quotation'}
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {activeQuotation && (
        <Card>
          <CardBody className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-500">Quotation Aktif</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm">{activeQuotation.docNumber}</span>
                <DocStatusBadge status={activeQuotation.status} />
                <span className="text-xs text-ink-400">v{activeQuotation.version}</span>
              </div>
              <p className="text-sm text-ink-700 mt-2">
                Total: <strong>{formatIDR(Number(activeQuotation.grandTotal))}</strong>
              </p>
              <p className="text-xs text-ink-500">Berlaku sampai {formatDate(activeQuotation.validityUntil)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {activeQuotation.status === 'SUBMITTED' && (
                <p className="text-sm text-ink-500 italic">Menunggu review admin</p>
              )}
              {activeQuotation.status === 'PENDING_VENDOR_SIGN' && (
                <Button onClick={() => setSigning(true)}>
                  <CheckCircle2 className="h-4 w-4" />
                  TTD Final
                </Button>
              )}
              {activeQuotation.status === 'SIGNED' && (
                <>
                  <span className="inline-flex items-center gap-1.5 text-sm text-leaf-600 font-medium">
                    <CheckCircle2 className="h-4 w-4" /> Final
                  </span>
                  <a href={`/api/documents/quotation/${activeQuotation.id}/pdf`} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                  </a>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {quotations.length > 1 && (
        <Card>
          <CardBody>
            <h3 className="font-display text-sm font-semibold mb-3">Riwayat Versi</h3>
            <ul className="space-y-2">
              {quotations.map((q) => (
                <li
                  key={q.id}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-ink-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{q.docNumber}</span>
                    <span className="text-ink-400">v{q.version}</span>
                    <DocStatusBadge status={q.status} />
                  </div>
                  <span className="text-ink-500">{formatRelativeTime(q.createdAt)}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <Modal
        open={signing}
        onClose={() => !isPending && setSigning(false)}
        title="TTD Final Quotation"
        description="Tanda tangan Anda akan digabungkan ke PDF final dan menjadi acuan untuk SPK."
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
            <Button
              onClick={handleVendorSign}
              loading={isPending}
              disabled={!signature.fileKey}
            >
              TTD &amp; Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
