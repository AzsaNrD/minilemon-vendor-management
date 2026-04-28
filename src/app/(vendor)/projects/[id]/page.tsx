import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireVendor } from '@/lib/permissions'
import { getCompanyInfo } from '@/lib/nda'
import { getSignedDownloadUrl } from '@/lib/s3'
import { ProjectStatusBadge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ProjectInfoCard } from '@/components/projects/ProjectInfoCard'
import { QuotationTabVendor } from '@/components/projects/QuotationTabVendor'
import { QuotationPreview } from '@/components/shared/QuotationPreview'
import { SPKTabVendor } from '@/components/projects/SPKTabVendor'
import { SPKPreview } from '@/components/shared/SPKPreview'
import { InvoiceTabVendor } from '@/components/projects/InvoiceTabVendor'
import { InvoicePreview } from '@/components/shared/InvoicePreview'
import { ChatThread } from '@/components/shared/ChatThread'
import { serializeQuotation } from '@/lib/quotation'
import { serializeInvoice } from '@/lib/invoice'

export default async function VendorProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await requireVendor()
  const { id } = await params
  const { tab } = await searchParams

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      vendor: { select: { id: true, fullName: true, vendorCode: true, category: true } },
      quotations: { orderBy: { createdAt: 'desc' } },
      spk: true,
      invoice: true,
    },
  })
  if (!project) notFound()
  if (project.vendorId !== session.user.vendorId) redirect('/projects')

  const { quotations: rawQuotations, spk, invoice: rawInvoice, ...projectInfo } = project
  const allQuotations = rawQuotations.map(serializeQuotation)
  const activeQuotation =
    allQuotations.find((q) => q.status !== 'SUPERSEDED') ?? allQuotations[0] ?? null
  const invoice = rawInvoice ? serializeInvoice(rawInvoice) : null

  const company = activeQuotation || spk || invoice ? await getCompanyInfo() : null
  const vendorFull = activeQuotation || spk || invoice
    ? await prisma.vendor.findUnique({ where: { id: project.vendorId } })
    : null

  const [quoVendorSig, quoAdminSig, spkVendorSig, spkAdminSig, invVendorSig] = await Promise.all([
    activeQuotation?.vendorSignatureKey
      ? getSignedDownloadUrl(activeQuotation.vendorSignatureKey).catch(() => undefined)
      : undefined,
    activeQuotation?.adminSignatureKey
      ? getSignedDownloadUrl(activeQuotation.adminSignatureKey).catch(() => undefined)
      : undefined,
    spk?.vendorSignatureKey ? getSignedDownloadUrl(spk.vendorSignatureKey).catch(() => undefined) : undefined,
    spk?.adminSignatureKey ? getSignedDownloadUrl(spk.adminSignatureKey).catch(() => undefined) : undefined,
    invoice?.vendorSignatureKey
      ? getSignedDownloadUrl(invoice.vendorSignatureKey).catch(() => undefined)
      : undefined,
  ])

  const canSubmitQuotation = ['QUOTATION_PENDING', 'QUOTATION_NEGOTIATION'].includes(project.status)
  const canSubmitInvoice = project.status === 'IN_PROGRESS' && !invoice
  const initialTab = ['info', 'quotation', 'spk', 'invoice', 'chat'].includes(tab ?? '')
    ? tab!
    : 'info'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Projects
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{project.name}</h1>
          <div className="mt-1">
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>
      </header>

      <Tabs defaultValue={initialTab}>
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="quotation">Quotation</TabsTrigger>
          <TabsTrigger value="spk">SPK</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <ProjectInfoCard project={projectInfo} isAdmin={false} />
        </TabsContent>

        <TabsContent value="quotation">
          <div className="space-y-4">
            <QuotationTabVendor
              projectId={project.id}
              quotations={allQuotations}
              activeQuotation={activeQuotation}
              canSubmit={canSubmitQuotation}
            />
            {activeQuotation && company && vendorFull && (
              <QuotationPreview
                quotation={activeQuotation}
                vendor={vendorFull}
                company={company}
                vendorSignatureUrl={quoVendorSig}
                adminSignatureUrl={quoAdminSig}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="spk">
          <div className="space-y-4">
            <SPKTabVendor spk={spk} />
            {spk && company && (
              <SPKPreview
                spk={spk}
                company={company}
                vendorSignatureUrl={spkVendorSig}
                adminSignatureUrl={spkAdminSig}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="invoice">
          <div className="space-y-4">
            <InvoiceTabVendor projectId={project.id} invoice={invoice} canSubmit={canSubmitInvoice} />
            {invoice && company && vendorFull && (
              <InvoicePreview
                invoice={invoice}
                vendor={vendorFull}
                company={company}
                vendorSignatureUrl={invVendorSig}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="chat">
          <ChatThread projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
