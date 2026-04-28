import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { FileText } from 'lucide-react'
import { requireVendor } from '@/lib/permissions'

export default async function VendorDocumentsPage() {
  await requireVendor()
  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">Documents</h1>
        <p className="mt-1 text-sm text-ink-600">Semua dokumen Anda akan muncul di sini.</p>
      </header>
      <Card>
        <CardBody>
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="Document Center menyusul"
            description="Fitur ini akan tersedia setelah Phase 2 (NDA + Project lifecycle)."
          />
        </CardBody>
      </Card>
    </div>
  )
}
