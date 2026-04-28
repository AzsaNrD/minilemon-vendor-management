import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requireAdmin } from '@/lib/permissions'
import { getProjectDetail } from '@/queries/projects'
import { ProjectStatusBadge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ProjectInfoCard } from '@/components/projects/ProjectInfoCard'
import { ProjectActionsMenu } from '@/components/projects/ProjectActionsMenu'
import { QuotationTabAdmin } from '@/components/projects/QuotationTabAdmin'
import { QuotationPreview } from '@/components/shared/QuotationPreview'
import { SPKTabAdmin } from '@/components/projects/SPKTabAdmin'
import { SPKPreview } from '@/components/shared/SPKPreview'
import { InvoiceTabAdmin } from '@/components/projects/InvoiceTabAdmin'
import { InvoicePreview } from '@/components/shared/InvoicePreview'
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

  const detail = await getProjectDetail(id)
  if (!detail) notFound()
  const { project, projectInfo, allQuotations, activeQuotation, spk, invoice, company, vendorFull, signatureUrls } =
    detail

  const initialTab = ['info', 'quotation', 'spk', 'invoice', 'chat'].includes(tab ?? '') ? tab! : 'info'

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
          <TabsTrigger value="spk">SPK</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <ProjectInfoCard project={projectInfo} isAdmin />
        </TabsContent>

        <TabsContent value="quotation">
          <div className="space-y-4">
            <QuotationTabAdmin quotations={allQuotations} activeQuotation={activeQuotation} />
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
            <SPKTabAdmin spk={spk} />
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
            <InvoiceTabAdmin invoice={invoice} />
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
