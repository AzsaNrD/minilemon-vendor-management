import Link from 'next/link'
import { Users, FolderKanban, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { Card, CardBody } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { VendorStatusBadge, ProjectStatusBadge } from '@/components/ui/Badge'
import { startOfMonth, formatRelativeTime } from '@/lib/utils'
import { IN_PROGRESS_STATUSES } from '@/lib/constants'

export default async function AdminDashboardPage() {
  await requireAdmin()

  const [activeVendors, activeProjects, pendingNDA, completedThisMonth, recentVendors, recentProjects] =
    await Promise.all([
      prisma.vendor.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.project.count({
        where: { status: { in: [...IN_PROGRESS_STATUSES] }, deletedAt: null },
      }),
      prisma.vendor.count({ where: { status: 'PENDING_ADMIN_SIGN', deletedAt: null } }),
      prisma.project.count({
        where: { completedAt: { gte: startOfMonth() } },
      }),
      prisma.vendor.findMany({
        where: { deletedAt: null },
        orderBy: { invitedAt: 'desc' },
        take: 5,
        include: { user: { select: { email: true } } },
      }),
      prisma.project.findMany({
        where: { deletedAt: null },
        orderBy: { lastUpdatedAt: 'desc' },
        take: 5,
        include: { vendor: { select: { fullName: true } } },
      }),
    ])

  const stats = [
    { label: 'Vendor Aktif', value: activeVendors, icon: Users, color: 'bg-leaf-100 text-leaf-600' },
    { label: 'Project Berjalan', value: activeProjects, icon: FolderKanban, color: 'bg-lemon-100 text-ink-800' },
    {
      label: 'Perlu Tindakan',
      value: pendingNDA,
      icon: AlertCircle,
      color: 'bg-coral-100 text-coral-600',
    },
    {
      label: 'Selesai Bulan Ini',
      value: completedThisMonth,
      icon: CheckCircle2,
      color: 'bg-leaf-100 text-leaf-600',
    },
  ]

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-ink-900">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-600">Ringkasan aktivitas vendor & project Minilemon.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardBody className="flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-ink-500">{s.label}</p>
                  <p className="font-display text-2xl font-bold text-ink-900">{s.value}</p>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-lg font-semibold">Vendor Terbaru</h2>
            <Link href="/admin/vendors" className="text-xs font-medium text-ink-600 hover:text-ink-900">
              Lihat semua →
            </Link>
          </div>
          <div className="divide-y divide-ink-100">
            {recentVendors.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-ink-500">Belum ada vendor.</div>
            ) : (
              recentVendors.map((v) => (
                <Link
                  key={v.id}
                  href={`/admin/vendors/${v.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-ink-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={v.fullName} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">{v.fullName}</p>
                      <p className="text-xs text-ink-500 truncate">{v.user.email}</p>
                    </div>
                  </div>
                  <VendorStatusBadge status={v.status} />
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-lg font-semibold">Project Terbaru</h2>
            <Link href="/admin/projects" className="text-xs font-medium text-ink-600 hover:text-ink-900">
              Lihat semua →
            </Link>
          </div>
          <div className="divide-y divide-ink-100">
            {recentProjects.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-ink-500">Belum ada project.</div>
            ) : (
              recentProjects.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{p.name}</p>
                    <p className="text-xs text-ink-500 truncate">
                      {p.vendor.fullName} · {formatRelativeTime(p.lastUpdatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ProjectStatusBadge status={p.status} />
                    <ArrowRight className="h-4 w-4 text-ink-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </div>
  )
}
