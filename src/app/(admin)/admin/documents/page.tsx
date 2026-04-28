import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { FileText } from 'lucide-react'
import { requireAdmin } from '@/lib/permissions'

export default async function AdminDocumentsPage() {
  await requireAdmin()
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Documents</h1>
        <p className="mt-1 text-sm text-ink-600">Document Center akan tersedia mulai Phase 4.</p>
      </header>
      <Card>
        <CardBody>
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="Document Center — Phase 4"
            description="Pencarian, filter, dan download semua NDA / Quotation / SPK / Invoice akan tersedia di sini."
          />
        </CardBody>
      </Card>
    </div>
  )
}
