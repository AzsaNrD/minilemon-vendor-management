import { requireAdmin } from '@/lib/permissions'
import { getCompanySettings } from '@/queries/settings'
import { Card, CardBody } from '@/components/ui/Card'
import { CompanySettingsForm } from '@/components/settings/CompanySettingsForm'

export default async function CompanySettingsPage() {
  await requireAdmin()
  const settings = await getCompanySettings()

  if (!settings) {
    return <div className="text-sm text-coral-600">Company settings belum diinisialisasi. Jalankan db seed.</div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Pengaturan Perusahaan</h1>
        <p className="mt-1 text-sm text-ink-600">
          Informasi ini akan muncul di header dokumen NDA, Quotation, SPK, dan Invoice.
        </p>
      </header>
      <Card>
        <CardBody>
          <CompanySettingsForm
            initial={{
              name: settings.name,
              address: settings.address,
              phone: settings.phone,
              email: settings.email,
              directorName: settings.directorName,
              directorTitle: settings.directorTitle,
            }}
          />
        </CardBody>
      </Card>
    </div>
  )
}
