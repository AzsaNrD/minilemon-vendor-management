import Link from 'next/link'
import { Users } from 'lucide-react'
import { requireAdmin } from '@/lib/permissions'
import { listAdminVendors } from '@/queries/vendors'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { VendorStatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { InviteVendorButton } from '@/components/vendors/InviteVendorButton'
import { VendorListFilter } from '@/components/vendors/VendorListFilter'

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  await requireAdmin()
  const params = await searchParams
  const vendors = await listAdminVendors({ status: params.status, q: params.q })

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Vendors</h1>
          <p className="mt-1 text-sm text-ink-600">Kelola seluruh vendor freelance Minilemon.</p>
        </div>
        <InviteVendorButton />
      </header>

      <VendorListFilter />

      <Card className="overflow-hidden">
        {vendors.length === 0 ? (
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="Belum ada vendor"
            description="Mulai dengan mengundang vendor baru via tombol di atas."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/40 text-xs uppercase tracking-wide text-ink-500">
                  <th className="text-left font-medium px-5 py-3">Nama</th>
                  <th className="text-left font-medium px-5 py-3">Kode</th>
                  <th className="text-left font-medium px-5 py-3">Kategori</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                  <th className="text-right font-medium px-5 py-3">Project</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-ink-50/40">
                    <td className="px-5 py-3">
                      <Link href={`/admin/vendors/${v.id}`} className="flex items-center gap-3">
                        <Avatar name={v.fullName} size="md" />
                        <div className="min-w-0">
                          <p className="font-medium text-ink-900">{v.fullName}</p>
                          <p className="text-xs text-ink-500">{v.user.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-600">{v.vendorCode}</td>
                    <td className="px-5 py-3 text-ink-700">{v.category || '—'}</td>
                    <td className="px-5 py-3">
                      <VendorStatusBadge status={v.status} />
                    </td>
                    <td className="px-5 py-3 text-right text-ink-700">{v._count.projects}</td>
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
