import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Mail, Phone, MapPin, CreditCard } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { Avatar } from '@/components/ui/Avatar'
import { Card, CardBody } from '@/components/ui/Card'
import { VendorStatusBadge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { VendorActionsMenu } from '@/components/vendors/VendorActionsMenu'
import { formatDate } from '@/lib/utils'

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, lastLoginAt: true, createdAt: true, isActive: true } },
      _count: { select: { projects: true } },
    },
  })

  if (!vendor) notFound()

  return (
    <div className="space-y-6">
      <Link href="/admin/vendors" className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Vendors
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={vendor.fullName} size="lg" />
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">{vendor.fullName}</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-xs text-ink-500">{vendor.vendorCode}</span>
              <span className="text-ink-300">·</span>
              <VendorStatusBadge status={vendor.status} />
            </div>
          </div>
        </div>
        <VendorActionsMenu vendorId={vendor.id} status={vendor.status} userActive={vendor.user.isActive} />
      </header>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nda" disabled>
            NDA
          </TabsTrigger>
          <TabsTrigger value="projects" disabled>
            Project History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardBody className="space-y-4">
                <h2 className="font-display text-lg font-semibold">Informasi Vendor</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <Field icon={<Mail className="h-4 w-4" />} label="Email" value={vendor.user.email} />
                  <Field icon={<Phone className="h-4 w-4" />} label="Telepon" value={vendor.phone || '—'} />
                  <Field icon={<MapPin className="h-4 w-4" />} label="Alamat" value={vendor.address || '—'} />
                  <Field
                    icon={<CreditCard className="h-4 w-4" />}
                    label="Bank"
                    value={
                      vendor.bankName
                        ? `${vendor.bankName} · ${vendor.bankAccountNo} a/n ${vendor.bankAccountHolder}`
                        : '—'
                    }
                  />
                  <Field label="Kategori" value={vendor.category || '—'} />
                  <Field label="Nama Perusahaan" value={vendor.companyName || '—'} />
                  <Field label="NIK" value={vendor.nik ? '••••••••••••' + vendor.nik.slice(-4) : '—'} />
                  <Field label="NPWP" value={vendor.npwp || '—'} />
                </dl>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-4">
                <h2 className="font-display text-lg font-semibold">Aktivitas Akun</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-500">Diundang</p>
                    <p className="text-ink-900">{formatDate(vendor.invitedAt, { withTime: true })}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-500">Profile Dilengkapi</p>
                    <p className="text-ink-900">
                      {vendor.profileCompletedAt ? formatDate(vendor.profileCompletedAt, { withTime: true }) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-500">Aktif Sejak</p>
                    <p className="text-ink-900">
                      {vendor.activatedAt ? formatDate(vendor.activatedAt, { withTime: true }) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-500">Login Terakhir</p>
                    <p className="text-ink-900">
                      {vendor.user.lastLoginAt ? formatDate(vendor.user.lastLoginAt, { withTime: true }) : 'Belum pernah'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-500">Total Project</p>
                    <p className="text-ink-900">{vendor._count.projects}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Field({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-500">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-ink-900">{value}</dd>
    </div>
  )
}
