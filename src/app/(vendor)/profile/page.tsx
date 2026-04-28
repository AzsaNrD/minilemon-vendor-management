import { redirect } from 'next/navigation'
import { requireVendor } from '@/lib/permissions'
import { getVendorProfile } from '@/queries/profile'
import { Card, CardBody } from '@/components/ui/Card'
import { VendorStatusBadge } from '@/components/ui/Badge'
import { VendorProfileForm } from '@/components/vendors/VendorProfileForm'

export default async function VendorProfilePage() {
  const session = await requireVendor()
  const data = await getVendorProfile(session.user.id)
  if (!data) redirect('/login')

  const { vendor, ktpPreviewUrl } = data
  const isFirstSubmission = vendor.status === 'PENDING_PROFILE'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-ink-900">Profil Saya</h1>
          <VendorStatusBadge status={vendor.status} />
        </div>
        <p className="mt-1 text-sm text-ink-600">
          {isFirstSubmission
            ? 'Lengkapi biodata Anda untuk melanjutkan ke tahap NDA.'
            : 'Perbarui informasi profil Anda. NIK tidak dapat diubah setelah dikirim.'}
        </p>
      </header>

      <Card>
        <CardBody>
          <VendorProfileForm
            email={vendor.user.email}
            initialData={{
              fullName: vendor.fullName,
              nik: vendor.nik || '',
              address: vendor.address || '',
              phone: vendor.phone || '',
              companyName: vendor.companyName || '',
              bankName: vendor.bankName || '',
              bankAccountNo: vendor.bankAccountNo || '',
              bankAccountHolder: vendor.bankAccountHolder || '',
              npwp: vendor.npwp || '',
              ktpFileKey: vendor.ktpFileKey || '',
            }}
            ktpPreviewUrl={ktpPreviewUrl}
            nikLocked={!!vendor.nik}
          />
        </CardBody>
      </Card>
    </div>
  )
}
