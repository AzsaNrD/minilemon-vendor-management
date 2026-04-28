'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Download, ExternalLink, BadgeCheck, Wallet } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DocStatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { approveInvoice, markInvoicePaid } from '@/actions/invoice'
import { formatDate, formatIDR } from '@/lib/utils'
import type { SerializedInvoice } from '@/lib/invoice'

export function InvoiceTabAdmin({ invoice }: { invoice: SerializedInvoice | null }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [approving, setApproving] = useState(false)
  const [marking, setMarking] = useState(false)
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10))
  const [paymentRef, setPaymentRef] = useState('')
  const [isPending, startTransition] = useTransition()

  if (!invoice) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-sm text-ink-500 italic">Vendor belum mengirim invoice.</p>
        </CardBody>
      </Card>
    )
  }

  function handleApprove() {
    startTransition(async () => {
      const result = await approveInvoice(invoice!.id)
      if (!result.ok) {
        showToast(result.error, 'error')
        return
      }
      showToast('Invoice disetujui', 'success', 'Project berstatus COMPLETED.')
      setApproving(false)
      router.refresh()
    })
  }

  function handleMarkPaid() {
    startTransition(async () => {
      const result = await markInvoicePaid(invoice!.id, { paidAt, paymentRef: paymentRef.trim() })
      if (!result.ok) {
        showToast(result.error, 'error')
        return
      }
      showToast('Invoice ditandai LUNAS', 'success')
      setMarking(false)
      setPaymentRef('')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-ink-500">Invoice</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{invoice.docNumber}</span>
              <DocStatusBadge status={invoice.status} />
              {invoice.paidAt && (
                <span className="inline-flex items-center gap-1 rounded-full bg-leaf-100 text-leaf-600 px-2 py-0.5 text-xs font-medium">
                  <BadgeCheck className="h-3 w-3" /> Lunas
                </span>
              )}
            </div>
            <p className="text-sm text-ink-700">
              Total: <strong>{formatIDR(invoice.amount)}</strong>
            </p>
            <p className="text-xs text-ink-500">Diajukan: {formatDate(invoice.invoiceDate)}</p>
            {invoice.deliverableDriveLink && (
              <Link
                href={invoice.deliverableDriveLink}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-leaf-600 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Lihat deliverable di Drive
              </Link>
            )}
            {invoice.paidAt && (
              <p className="text-xs text-leaf-600 font-medium">
                Dibayar {formatDate(invoice.paidAt)} · Ref: {invoice.paymentRef}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {invoice.status === 'SUBMITTED' && (
              <Button onClick={() => setApproving(true)}>
                <CheckCircle2 className="h-4 w-4" />
                Approve Invoice
              </Button>
            )}
            {invoice.status === 'APPROVED' && !invoice.paidAt && (
              <Button onClick={() => setMarking(true)}>
                <Wallet className="h-4 w-4" />
                Mark as Paid
              </Button>
            )}
            <a href={`/api/documents/invoice/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </a>
          </div>
        </CardBody>
      </Card>

      <Modal
        open={approving}
        onClose={() => !isPending && setApproving(false)}
        title="Approve Invoice"
        description="Pastikan deliverable sudah Anda review. Setelah approve, project akan COMPLETED."
      >
        <div className="space-y-3">
          <div className="rounded-lg bg-ink-50/40 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-ink-600">No. Invoice</span>
              <span className="font-mono">{invoice.docNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-600">Total</span>
              <span className="font-bold">{formatIDR(invoice.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-600">Tanggal</span>
              <span>{formatDate(invoice.invoiceDate)}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setApproving(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={handleApprove} loading={isPending}>
              Approve
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={marking}
        onClose={() => !isPending && setMarking(false)}
        title="Tandai Lunas"
        description="Catat tanggal & nomor referensi pembayaran (transaksi bank, dll)."
      >
        <div className="space-y-3">
          <Input
            type="date"
            label="Tanggal Pembayaran"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            required
          />
          <Input
            label="Nomor Referensi"
            placeholder="cth. TF-20260428-001 atau no. mutasi"
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setMarking(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={handleMarkPaid} loading={isPending} disabled={paymentRef.trim().length === 0}>
              Tandai Lunas
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
