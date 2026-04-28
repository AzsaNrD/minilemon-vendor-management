'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Download, Pen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { DocStatusBadge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { adminSignNDA } from '@/actions/nda'
import { formatDate } from '@/lib/utils'
import type { NDA } from '@prisma/client'

export function AdminNDAActions({ vendorId, nda }: { vendorId: string; nda: NDA }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSign() {
    startTransition(async () => {
      const result = await adminSignNDA(vendorId, {})
      if (!result.ok) {
        showToast(result.error, 'error')
        if (result.error.toLowerCase().includes('master signature')) {
          // help user navigate to settings
        }
        setConfirming(false)
        return
      }
      showToast('NDA berhasil ditandatangani', 'success', 'Vendor sekarang aktif.')
      setConfirming(false)
      router.refresh()
    })
  }

  return (
    <>
      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Status NDA</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm">{nda.docNumber}</span>
              <DocStatusBadge status={nda.status} />
            </div>
            {nda.vendorSignedAt && (
              <p className="text-xs text-ink-500 mt-2">
                Vendor TTD: {formatDate(nda.vendorSignedAt, { withTime: true })}
              </p>
            )}
            {nda.adminSignedAt && (
              <p className="text-xs text-ink-500">Admin TTD: {formatDate(nda.adminSignedAt, { withTime: true })}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {nda.status === 'PENDING_VENDOR_SIGN' && (
              <p className="text-sm text-ink-500 italic">Menunggu vendor menandatangani</p>
            )}
            {nda.status === 'PENDING_ADMIN_SIGN' && (
              <Button onClick={() => setConfirming(true)}>
                <Pen className="h-4 w-4" />
                TTD NDA Sekarang
              </Button>
            )}
            {nda.status === 'SIGNED' && (
              <>
                <span className="inline-flex items-center gap-1.5 text-sm text-leaf-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> NDA aktif
                </span>
                <a href={`/api/documents/nda/${nda.id}/pdf`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </a>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      <Modal
        open={confirming}
        onClose={() => !isPending && setConfirming(false)}
        title="Tanda tangani NDA"
        description="Master signature dari Settings akan digunakan untuk menandatangani dokumen ini. PDF final akan otomatis di-generate dan vendor akan diaktifkan."
      >
        <div className="space-y-3">
          <p className="text-sm text-ink-700">
            Pastikan Anda telah meng-upload master signature di{' '}
            <Link
              href="/admin/settings/signature"
              className="font-medium underline underline-offset-2 hover:text-ink-900"
            >
              Settings → Signature
            </Link>
            .
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={handleSign} loading={isPending}>
              Ya, TTD &amp; Aktifkan Vendor
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
