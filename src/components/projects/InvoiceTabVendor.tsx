'use client'

import Link from 'next/link'
import { BadgeCheck, CheckCircle2, Download, ExternalLink, Receipt } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DocStatusBadge } from '@/components/ui/Badge'
import { formatDate, formatIDR } from '@/lib/utils'
import type { SerializedInvoice } from '@/lib/invoice'

interface Props {
  projectId: string
  invoice: SerializedInvoice | null
  canSubmit: boolean
}

export function InvoiceTabVendor({ projectId, invoice, canSubmit }: Props) {
  if (!invoice && !canSubmit) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-sm text-ink-500 italic">
            Invoice bisa disubmit setelah project dalam fase pengerjaan (SPK aktif).
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {!invoice && canSubmit && (
        <Card>
          <CardBody className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-ink-900">Submit invoice</p>
              <p className="text-xs text-ink-500 mt-0.5">
                Selesaikan pengerjaan dan kirim invoice dengan tautan deliverable Anda.
              </p>
            </div>
            <Link href={`/projects/${projectId}/invoice`}>
              <Button>
                <Receipt className="h-4 w-4" />
                Submit Invoice
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {invoice && (
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
                  Deliverable di Drive
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
                <p className="text-sm text-ink-500 italic">Menunggu approval admin</p>
              )}
              {invoice.status === 'APPROVED' && !invoice.paidAt && (
                <span className="inline-flex items-center gap-1.5 text-sm text-leaf-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Disetujui — menunggu transfer
                </span>
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
      )}
    </div>
  )
}
