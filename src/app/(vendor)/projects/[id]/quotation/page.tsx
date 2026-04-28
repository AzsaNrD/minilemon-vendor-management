import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { requireVendor } from '@/lib/permissions'
import { Card, CardBody } from '@/components/ui/Card'
import { SubmitQuotationForm } from '@/components/projects/SubmitQuotationForm'
import type { QuotationItemInput } from '@/schemas/quotation'

export default async function SubmitQuotationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ revise?: string }>
}) {
  const session = await requireVendor()
  const { id } = await params
  const { revise } = await searchParams

  const project = await prisma.project.findUnique({
    where: { id },
    include: { quotations: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })
  if (!project) notFound()
  if (project.vendorId !== session.user.vendorId) redirect('/projects')
  if (!['QUOTATION_PENDING', 'QUOTATION_NEGOTIATION'].includes(project.status)) {
    redirect(`/projects/${id}?tab=quotation`)
  }

  let parent = null
  if (revise) {
    parent = await prisma.quotation.findUnique({ where: { id: revise } })
    if (!parent || parent.projectId !== project.id) parent = null
  } else if (project.status === 'QUOTATION_NEGOTIATION') {
    parent = project.quotations.find((q) => q.status === 'REVISION_REQUESTED') ?? null
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href={`/projects/${project.id}?tab=quotation`}
        className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Project
      </Link>

      <header>
        <h1 className="font-display text-3xl font-bold">
          {parent ? 'Submit Revisi Quotation' : 'Submit Quotation'}
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Project: <strong>{project.name}</strong>
        </p>
      </header>

      {parent?.revisionRequestNote && (
        <Card>
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-coral-600">Catatan Revisi dari Admin</p>
            <p className="mt-1 text-sm text-ink-800 whitespace-pre-wrap">{parent.revisionRequestNote}</p>
          </CardBody>
        </Card>
      )}

      <SubmitQuotationForm
        projectId={project.id}
        parentQuotationId={parent?.id}
        defaultItems={parent ? (parent.items as unknown as QuotationItemInput[]) : undefined}
        defaultPpnEnabled={parent?.ppnEnabled}
        defaultDiscount={parent ? Number(parent.discount) : undefined}
        defaultNotes={parent?.notes ?? undefined}
        defaultValidityUntil={parent ? parent.validityUntil.toISOString().slice(0, 10) : undefined}
      />
    </div>
  )
}
