import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { requireVendor } from '@/lib/permissions'
import { Card, CardBody } from '@/components/ui/Card'
import { SubmitInvoiceForm } from '@/components/projects/SubmitInvoiceForm'
import { formatIDR } from '@/lib/utils'

export default async function SubmitInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireVendor()
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      invoice: true,
      spk: true,
      vendor: true,
      quotations: { where: { status: 'SIGNED' }, take: 1 },
    },
  })
  if (!project) notFound()
  if (project.vendorId !== session.user.vendorId) redirect('/projects')
  if (project.status !== 'IN_PROGRESS') redirect(`/projects/${id}?tab=invoice`)
  if (project.invoice) redirect(`/projects/${id}?tab=invoice`)
  if (!project.spk || project.spk.status !== 'SIGNED') redirect(`/projects/${id}?tab=invoice`)
  const signedQuotation = project.quotations[0]
  if (!signedQuotation) redirect(`/projects/${id}?tab=invoice`)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/projects/${project.id}?tab=invoice`}
        className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Project
      </Link>

      <header>
        <h1 className="font-display text-3xl font-bold">Submit Invoice</h1>
        <p className="mt-1 text-sm text-ink-600">
          Project: <strong>{project.name}</strong>
        </p>
      </header>

      <Card>
        <CardBody className="space-y-1 text-sm">
          <p className="text-xs uppercase tracking-wide text-ink-500">Detail tagihan</p>
          <p>
            Bank: <strong>{project.vendor.bankName}</strong> &middot; {project.vendor.bankAccountNo} a/n{' '}
            {project.vendor.bankAccountHolder}
          </p>
          <p>
            Nominal otomatis sesuai Quotation final:{' '}
            <strong>{formatIDR(Number(signedQuotation.grandTotal))}</strong>
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <SubmitInvoiceForm projectId={project.id} />
        </CardBody>
      </Card>
    </div>
  )
}
