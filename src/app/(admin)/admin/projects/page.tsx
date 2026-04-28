import Link from 'next/link'
import { Plus, FolderKanban } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProjectStatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProjectListFilter } from '@/components/projects/ProjectListFilter'
import { PROJECT_STATUS_LABEL } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/utils'
import type { Prisma, ProjectStatus } from '@prisma/client'

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  await requireAdmin()
  const params = await searchParams

  const where: Prisma.ProjectWhereInput = { deletedAt: null }
  if (params.status && params.status !== 'all' && params.status in PROJECT_STATUS_LABEL) {
    where.status = params.status as ProjectStatus
  }
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: 'insensitive' } },
      { vendor: { fullName: { contains: params.q, mode: 'insensitive' } } },
    ]
  }

  const projects = await prisma.project.findMany({
    where,
    include: { vendor: { select: { fullName: true, vendorCode: true } } },
    orderBy: { lastUpdatedAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Projects</h1>
          <p className="mt-1 text-sm text-ink-600">Kelola seluruh project dengan vendor.</p>
        </div>
        <Link href="/admin/projects/new">
          <Button>
            <Plus className="h-4 w-4" />
            Project Baru
          </Button>
        </Link>
      </header>

      <ProjectListFilter />

      <Card className="overflow-hidden">
        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="h-5 w-5" />}
            title="Belum ada project"
            description="Buat project pertama dengan vendor aktif."
            action={
              <Link href="/admin/projects/new">
                <Button>Buat Project</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/40 text-xs uppercase tracking-wide text-ink-500">
                  <th className="text-left font-medium px-5 py-3">Project</th>
                  <th className="text-left font-medium px-5 py-3">Vendor</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                  <th className="text-left font-medium px-5 py-3">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-50/40">
                    <td className="px-5 py-3">
                      <Link href={`/admin/projects/${p.id}`} className="font-medium text-ink-900 hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink-700">
                      {p.vendor.fullName}{' '}
                      <span className="text-xs text-ink-400">({p.vendor.vendorCode})</span>
                    </td>
                    <td className="px-5 py-3">
                      <ProjectStatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3 text-xs text-ink-500">{formatRelativeTime(p.lastUpdatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
