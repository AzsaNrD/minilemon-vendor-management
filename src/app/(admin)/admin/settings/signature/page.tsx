import { requireAdmin } from '@/lib/permissions'
import { getMasterSignatureContext } from '@/queries/settings'
import { Card, CardBody } from '@/components/ui/Card'
import { MasterSignatureForm } from '@/components/settings/MasterSignatureForm'

export default async function MasterSignaturePage() {
  await requireAdmin()
  const { settings, currentUrl } = await getMasterSignatureContext()

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Master Signature</h1>
        <p className="mt-1 text-sm text-ink-600">
          Tanda tangan ini akan digunakan saat admin menandatangani NDA, Quotation, SPK, dan dokumen lainnya.
        </p>
      </header>
      <Card>
        <CardBody>
          <MasterSignatureForm
            currentFileKey={settings?.adminMasterSignatureKey ?? undefined}
            currentUrl={currentUrl}
          />
        </CardBody>
      </Card>
      <p className="text-xs text-ink-500">
        Tip: gunakan PNG dengan latar transparan agar tampak natural di atas dokumen. Disarankan resolusi minimal 600
        × 200 pixel.
      </p>
    </div>
  )
}
