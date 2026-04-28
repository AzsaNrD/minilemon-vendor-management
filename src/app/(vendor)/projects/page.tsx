import Link from 'next/link'
import { FolderKanban } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { requireVendor } from '@/lib/permissions'
import { Card, CardBody } from '@/components/ui/Card'
import { ProjectStatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRelativeTime } from '@/lib/utils'

export default async function VendorProjectsPage() {
  const session = await requireVendor()
  if (!session.user.vendorId) return null

  const projects = await prisma.project.findMany({
    where: { vendorId: session.user.vendorId, deletedAt: null },
    orderBy: { lastUpdatedAt: 'desc' },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Projects</h1>
        <p className="mt-1 text-sm text-ink-600">Daftar seluruh project yang ditugaskan kepada Anda.</p>
      </header>
      {projects.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderKanban className="h-5 w-5" />}
            title="Belum ada project"
            description="Tim Minilemon akan mengirim notifikasi ketika ada project baru untuk Anda."
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <Card className="hover:shadow-card transition-shadow">
                <CardBody className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 truncate">{p.name}</p>
                    <p className="text-xs text-ink-500">Update {formatRelativeTime(p.lastUpdatedAt)}</p>
                  </div>
                  <ProjectStatusBadge status={p.status} />
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
