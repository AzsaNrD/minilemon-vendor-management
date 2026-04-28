'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Download, MessageSquareWarning, Pen } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DocStatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { adminSignQuotation, requestQuotationRevision } from '@/actions/quotations'
import { formatDate, formatIDR, formatRelativeTime } from '@/lib/utils'
import type { Quotation } from '@prisma/client'

interface Props {
  quotations: Quotation[]
  activeQuotation: Quotation | null
}

export function QuotationTabAdmin({ quotations, activeQuotation }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [signing, setSigning] = useState(false)
  const [revising, setRevising] = useState(false)
  const [reviseNote, setReviseNote] = useState('')
  const [isPending, startTransition] = useTransition()

  if (!activeQuotation) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-sm text-ink-500 italic">Vendor belum mengirim quotation.</p>
        </CardBody>
      </Card>
    )
  }

  function handleSign() {
    if (!activeQuotation) return
    startTransition(async () => {
      const result = await adminSignQuotation(activeQuotation.id, {})
      if (!result.ok) {
        showToast(result.error, 'error')
        setSigning(false)
        return
      }
      showToast('Quotation disetujui', 'success', 'Vendor diminta TTD final.')
      setSigning(false)
      router.refresh()
    })
  }

  function handleRequestRevision() {
    if (!activeQuotation) return
    startTransition(async () => {
      const result = await requestQuotationRevision(activeQuotation.id, { note: reviseNote })
      if (!result.ok) {
        showToast(result.error, 'error')
        return
      }
      showToast('Permintaan revisi terkirim', 'success')
      setRevising(false)
      setReviseNote('')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
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
            {activeQuotation.revisionRequestNote && activeQuotation.status === 'REVISION_REQUESTED' && (
              <p className="mt-2 text-xs text-coral-600 italic">
                Catatan revisi: &quot;{activeQuotation.revisionRequestNote}&quot;
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeQuotation.status === 'SUBMITTED' && (
              <>
                <Button onClick={() => setSigning(true)}>
                  <CheckCircle2 className="h-4 w-4" />
                  Approve &amp; TTD
                </Button>
                <Button variant="outline" onClick={() => setRevising(true)}>
                  <MessageSquareWarning className="h-4 w-4" />
                  Minta Revisi
                </Button>
              </>
            )}
            {activeQuotation.status === 'PENDING_VENDOR_SIGN' && (
              <p className="text-sm text-ink-500 italic">Menunggu TTD final dari vendor</p>
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
            {activeQuotation.status === 'REVISION_REQUESTED' && (
              <p className="text-sm text-ink-500 italic">Menunggu revisi dari vendor</p>
            )}
          </div>
        </CardBody>
      </Card>

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
        title="Approve & TTD Quotation"
        description="Master signature akan digunakan. Setelah TTD admin, vendor diminta TTD final."
      >
        <div className="space-y-3">
          <div className="rounded-lg bg-ink-50/40 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-600">Doc Number</span>
              <span className="font-mono">{activeQuotation.docNumber}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-ink-600">Grand Total</span>
              <span className="font-bold">{formatIDR(Number(activeQuotation.grandTotal))}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-ink-600">Berlaku sampai</span>
              <span>{formatDate(activeQuotation.validityUntil)}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setSigning(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={handleSign} loading={isPending}>
              Approve &amp; TTD
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={revising}
        onClose={() => !isPending && setRevising(false)}
        title="Minta Revisi Quotation"
        description="Catatan revisi akan dikirim ke vendor."
      >
        <div className="space-y-3">
          <Textarea
            value={reviseNote}
            onChange={(e) => setReviseNote(e.target.value)}
            label="Catatan revisi"
            placeholder="cth. Mohon turunkan harga voice over jadi 1.5jt..."
            rows={4}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setRevising(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={handleRequestRevision} loading={isPending} disabled={reviseNote.trim().length < 5}>
              Kirim Permintaan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
