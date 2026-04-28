import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { FolderKanban } from 'lucide-react'
import { requireAdmin } from '@/lib/permissions'

export default async function AdminProjectsPage() {
  await requireAdmin()
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Projects</h1>
        <p className="mt-1 text-sm text-ink-600">Phase 3 — manajemen project & quotation.</p>
      </header>
      <Card>
        <CardBody>
          <EmptyState
            icon={<FolderKanban className="h-5 w-5" />}
            title="Project module — Phase 3"
            description="Saat ini fokus pada onboarding vendor. Phase 3 akan menambahkan create project, quotation flow, dan SPK."
          />
        </CardBody>
      </Card>
    </div>
  )
}
