import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { getCompanyInfo } from '@/lib/nda'
import { getSignedDownloadUrl } from '@/lib/s3'
import { Card, CardBody } from '@/components/ui/Card'
import { ProjectStatusBadge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ProjectInfoCard } from '@/components/projects/ProjectInfoCard'
import { ProjectActionsMenu } from '@/components/projects/ProjectActionsMenu'
import { QuotationTabAdmin } from '@/components/projects/QuotationTabAdmin'
import { QuotationPreview } from '@/components/shared/QuotationPreview'
import { ChatThread } from '@/components/shared/ChatThread'

export default async function AdminProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const { tab } = await searchParams

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      vendor: { select: { id: true, fullName: true, vendorCode: true, category: true } },
      quotations: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!project) notFound()

  const activeQuotation =
    project.quotations.find((q) => q.status !== 'SUPERSEDED') ?? project.quotations[0] ?? null

  const company = activeQuotation ? await getCompanyInfo() : null
  const vendorFull = activeQuotation
    ? await prisma.vendor.findUnique({ where: { id: project.vendorId } })
    : null
  const [vendorSigUrl, adminSigUrl] = activeQuotation
    ? await Promise.all([
        activeQuotation.vendorSignatureKey
          ? getSignedDownloadUrl(activeQuotation.vendorSignatureKey).catch(() => undefined)
          : undefined,
        activeQuotation.adminSignatureKey
          ? getSignedDownloadUrl(activeQuotation.adminSignatureKey).catch(() => undefined)
          : undefined,
      ])
    : [undefined, undefined]

  const initialTab = ['info', 'quotation', 'spk', 'invoice', 'chat'].includes(tab ?? '')
    ? tab!
    : 'info'

  return (
    <div className="space-y-6">
      <Link href="/admin/projects" className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Projects
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{project.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            <span className="text-ink-300">·</span>
            <span className="text-sm text-ink-600">
              {project.vendor.fullName}{' '}
              <span className="text-xs text-ink-400">({project.vendor.vendorCode})</span>
            </span>
          </div>
        </div>
        <ProjectActionsMenu projectId={project.id} status={project.status} />
      </header>

      <Tabs defaultValue={initialTab}>
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="quotation">Quotation</TabsTrigger>
          <TabsTrigger value="spk" disabled>
            SPK
          </TabsTrigger>
          <TabsTrigger value="invoice" disabled>
            Invoice
          </TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <ProjectInfoCard project={project} isAdmin />
        </TabsContent>

        <TabsContent value="quotation">
          <div className="space-y-4">
            <QuotationTabAdmin quotations={project.quotations} activeQuotation={activeQuotation} />
            {activeQuotation && company && vendorFull && (
              <QuotationPreview
                quotation={activeQuotation}
                vendor={vendorFull}
                company={company}
                vendorSignatureUrl={vendorSigUrl}
                adminSignatureUrl={adminSigUrl}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="spk">
          <Card>
            <CardBody className="py-12 text-center text-sm text-ink-500 italic">
              Modul SPK akan tersedia di Phase 4.
            </CardBody>
          </Card>
        </TabsContent>

        <TabsContent value="invoice">
          <Card>
            <CardBody className="py-12 text-center text-sm text-ink-500 italic">
              Modul Invoice akan tersedia di Phase 4.
            </CardBody>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <ChatThread projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
