import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { FileText } from 'lucide-react'
import { requireVendor } from '@/lib/permissions'

export default async function VendorNDAPage() {
  await requireVendor()
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardBody>
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="NDA akan tersedia di Phase 2"
            description="Fitur penandatanganan NDA bilateral sedang dalam pengembangan."
          />
        </CardBody>
      </Card>
    </div>
  )
}
