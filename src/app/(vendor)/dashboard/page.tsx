import Link from 'next/link'
import { CheckCircle2, FileText, FolderKanban, Clock } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { requireVendor } from '@/lib/permissions'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProjectStatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRelativeTime } from '@/lib/utils'

export default async function VendorDashboardPage() {
  const session = await requireVendor()
  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  })

  if (!vendor) {
    return <EmptyState title="Profil belum siap" description="Hubungi admin untuk aktivasi akun." />
  }

  if (vendor.status === 'PENDING_PROFILE') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardBody className="space-y-4">
            <h1 className="font-display text-2xl font-bold">Selamat datang, {vendor.fullName.split(' ')[0]}!</h1>
            <p className="text-sm text-ink-600">
              Sebelum mulai, mohon lengkapi biodata Anda terlebih dahulu (KTP, alamat, rekening bank).
            </p>
            <Link href="/profile">
              <Button>Lengkapi Biodata</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (vendor.status === 'PENDING_NDA_SIGN') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardBody className="space-y-4">
            <h1 className="font-display text-2xl font-bold">Tinggal satu langkah lagi</h1>
            <p className="text-sm text-ink-600">
              Mohon baca dan tandatangani Non-Disclosure Agreement (NDA) yang sudah kami siapkan.
            </p>
            <Link href="/nda">
              <Button>Baca & TTD NDA</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (vendor.status === 'PENDING_ADMIN_SIGN') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardBody className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lemon-100">
              <Clock className="h-6 w-6 text-ink-800" />
            </div>
            <h1 className="font-display text-xl font-bold">Menunggu approval admin</h1>
            <p className="text-sm text-ink-600">
              Terima kasih sudah TTD NDA. Tim Minilemon akan menyelesaikan proses approval segera.
            </p>
          </CardBody>
        </Card>
      </div>
    )
  }

  // ACTIVE
  const projects = await prisma.project.findMany({
    where: { vendorId: vendor.id, deletedAt: null },
    orderBy: { lastUpdatedAt: 'desc' },
    take: 10,
  })

  const counts = {
    inProgress: projects.filter((p) => p.status === 'IN_PROGRESS').length,
    pending: projects.filter((p) => ['QUOTATION_PENDING', 'SPK_PENDING_SIGN', 'INVOICE_SUBMITTED'].includes(p.status)).length,
    completed: projects.filter((p) => p.status === 'COMPLETED').length,
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="font-display text-3xl font-bold">Halo, {vendor.fullName.split(' ')[0]} 👋</h1>
        <p className="mt-1 text-sm text-ink-600">Berikut ringkasan project Anda.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Sedang Dikerjakan" value={counts.inProgress} icon={<FolderKanban className="h-5 w-5" />} />
        <StatCard label="Menunggu Tindakan" value={counts.pending} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Selesai" value={counts.completed} icon={<CheckCircle2 className="h-5 w-5" />} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-semibold">Project Terbaru</h2>
          <Link href="/projects" className="text-sm font-medium text-ink-600 hover:text-ink-900">
            Lihat semua →
          </Link>
        </div>
        {projects.length === 0 ? (
          <Card>
            <EmptyState
              icon={<FolderKanban className="h-5 w-5" />}
              title="Belum ada project"
              description="Saat ini Anda belum mendapat project. Tim Minilemon akan menghubungi jika ada peluang baru."
            />
          </Card>
        ) : (
          <div className="space-y-2">
            {projects.map((p) => (
              <Card key={p.id}>
                <CardBody className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 truncate">{p.name}</p>
                    <p className="text-xs text-ink-500">Update {formatRelativeTime(p.lastUpdatedAt)}</p>
                  </div>
                  <ProjectStatusBadge status={p.status} />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lemon-100 text-ink-800">{icon}</div>
        <div>
          <p className="text-xs text-ink-500">{label}</p>
          <p className="font-display text-2xl font-bold">{value}</p>
        </div>
      </CardBody>
    </Card>
  )
}
