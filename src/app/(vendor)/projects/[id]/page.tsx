import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { requireVendor } from '@/lib/permissions'
import { getProjectDetail } from '@/queries/projects'
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

  const detail = await getProjectDetail(id)
  if (!detail) notFound()
  if (detail.project.vendorId !== session.user.vendorId) redirect('/projects')

  const { project, projectInfo, allQuotations, activeQuotation, spk, invoice, company, vendorFull, signatureUrls } =
    detail

  const canSubmitQuotation = ['QUOTATION_PENDING', 'QUOTATION_NEGOTIATION'].includes(project.status)
  const canSubmitInvoice = project.status === 'IN_PROGRESS' && !invoice
  const initialTab = ['info', 'quotation', 'spk', 'invoice', 'chat'].includes(tab ?? '') ? tab! : 'info'

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
                vendorSignatureUrl={signatureUrls.quoVendor}
                adminSignatureUrl={signatureUrls.quoAdmin}
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
                vendorSignatureUrl={signatureUrls.spkVendor}
                adminSignatureUrl={signatureUrls.spkAdmin}
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
                vendorSignatureUrl={signatureUrls.invVendor}
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
