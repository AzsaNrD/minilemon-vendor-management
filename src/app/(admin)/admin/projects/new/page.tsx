import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import { requireAdmin } from '@/lib/permissions'
import { listActiveVendorsForSelect } from '@/queries/vendors'
import { Card, CardBody } from '@/components/ui/Card'
import { NewProjectForm } from '@/components/projects/NewProjectForm'
import { EmptyState } from '@/components/ui/EmptyState'

export default async function NewProjectPage() {
  await requireAdmin()
  const vendors = await listActiveVendorsForSelect()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/admin/projects" className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Projects
      </Link>

      <header>
        <h1 className="font-display text-3xl font-bold text-ink-900">Project Baru</h1>
        <p className="mt-1 text-sm text-ink-600">Tugaskan project ke vendor aktif.</p>
      </header>

      <Card>
        <CardBody>
          {vendors.length === 0 ? (
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="Belum ada vendor aktif"
              description="Undang dan aktifkan vendor terlebih dahulu (NDA harus selesai)."
            />
          ) : (
            <NewProjectForm vendors={vendors} />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
