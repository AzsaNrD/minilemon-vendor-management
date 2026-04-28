import { redirect } from 'next/navigation'
import { Clock, Download } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { requireVendor } from '@/lib/permissions'
import { getCompanyInfo } from '@/lib/nda'
import { getSignedDownloadUrl } from '@/lib/s3'
import { Card, CardBody } from '@/components/ui/Card'
import { DocStatusBadge } from '@/components/ui/Badge'
import { NDAPreview } from '@/components/shared/NDAPreview'
import { NDASignPanel } from '@/components/shared/NDASignPanel'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

export default async function VendorNDAPage() {
  const session = await requireVendor()
  if (!session.user.vendorId) redirect('/dashboard')

  const nda = await prisma.nDA.findFirst({
    where: { vendorId: session.user.vendorId, status: { not: 'SUPERSEDED' } },
    orderBy: { createdAt: 'desc' },
  })

  if (!nda) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardBody className="text-center space-y-3">
            <h1 className="font-display text-xl font-bold">NDA belum tersedia</h1>
            <p className="text-sm text-ink-600">
              Pastikan Anda telah melengkapi biodata. NDA akan otomatis dibuat setelah profil tersimpan.
            </p>
          </CardBody>
        </Card>
      </div>
    )
  }

  const company = await getCompanyInfo()
  const [vendorSigUrl, adminSigUrl] = await Promise.all([
    nda.vendorSignatureKey ? getSignedDownloadUrl(nda.vendorSignatureKey).catch(() => undefined) : undefined,
    nda.adminSignatureKey ? getSignedDownloadUrl(nda.adminSignatureKey).catch(() => undefined) : undefined,
  ])

  const showSignPanel = nda.status === 'PENDING_VENDOR_SIGN'

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Non-Disclosure Agreement</h1>
          <p className="mt-1 text-sm text-ink-600">
            <span className="font-mono">{nda.docNumber}</span> &middot; Berlaku sejak{' '}
            {formatDate(nda.effectiveDate)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DocStatusBadge status={nda.status} />
          {nda.status === 'SIGNED' && nda.pdfFileKey && (
            <a href={`/api/documents/nda/${nda.id}/pdf`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </a>
          )}
        </div>
      </header>

      {nda.status === 'PENDING_ADMIN_SIGN' && (
        <Card>
          <CardBody className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-ink-600 shrink-0" />
            <p className="text-sm text-ink-700">
              Tanda tangan Anda sudah tersimpan. NDA sekarang menunggu approval dari admin Minilemon.
            </p>
          </CardBody>
        </Card>
      )}

      <div className={`grid gap-6 ${showSignPanel ? 'lg:grid-cols-[1fr_360px]' : ''}`}>
        <div>
          <NDAPreview nda={nda} company={company} vendorSignatureUrl={vendorSigUrl} adminSignatureUrl={adminSigUrl} />
        </div>
        {showSignPanel && (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <NDASignPanel ndaId={nda.id} vendorName={(nda.vendorSnapshot as any).fullName} />
          </aside>
        )}
      </div>
    </div>
  )
}
