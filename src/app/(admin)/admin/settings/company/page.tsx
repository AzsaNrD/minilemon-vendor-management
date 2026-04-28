import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Settings } from 'lucide-react'
import { requireAdmin } from '@/lib/permissions'

export default async function CompanySettingsPage() {
  await requireAdmin()
  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Pengaturan</h1>
        <p className="mt-1 text-sm text-ink-600">Master signature & company info — tersedia di Phase 2 dan 4.</p>
      </header>
      <Card>
        <CardBody>
          <EmptyState
            icon={<Settings className="h-5 w-5" />}
            title="Settings menyusul"
            description="Master signature admin akan dibuka di Phase 2, company info di Phase 4."
          />
        </CardBody>
      </Card>
    </div>
  )
}
