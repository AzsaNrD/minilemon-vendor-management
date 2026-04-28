import type { SPK, CompanySettings } from '@prisma/client'
import type { VendorSnapshot } from '@/schemas/nda'
import { formatDate } from '@/lib/utils'

interface SPKPreviewProps {
  spk: SPK
  company: CompanySettings
  vendorSignatureUrl?: string
  adminSignatureUrl?: string
}

export function SPKPreview({ spk, company, vendorSignatureUrl, adminSignatureUrl }: SPKPreviewProps) {
  const snapshot = spk.vendorSnapshot as unknown as VendorSnapshot
  const scopeItems = (spk.scopeItems as unknown as string[]) || []

  return (
    <article className="bg-white rounded-xl border border-ink-100 p-8 md:p-10 shadow-soft text-ink-800 leading-relaxed text-sm">
      <header className="border-b-2 border-ink-900 pb-3 mb-6">
        <p className="font-display text-base font-bold text-ink-900">{company.name}</p>
        <p className="text-xs text-ink-500">{company.address}</p>
        <p className="text-xs text-ink-500">
          {company.phone} &middot; {company.email}
        </p>
      </header>

      <div className="text-center mb-6">
        <h1 className="font-display text-xl font-bold tracking-wider text-ink-900">SURAT PERINTAH KERJA</h1>
        <p className="text-xs text-ink-500 mt-1">No. {spk.docNumber}</p>
      </div>

      <p className="mb-4">
        Yang bertanda tangan di bawah ini, atas nama <strong>{company.name}</strong>, dengan ini memberikan
        perintah kerja kepada:
      </p>

      <div className="border border-ink-100 rounded-lg p-4 mb-6">
        <Row label="Nama" value={snapshot.fullName} />
        {snapshot.companyName && <Row label="Perusahaan" value={snapshot.companyName} />}
        <Row label="NIK" value={snapshot.nik} />
        <Row label="Alamat" value={snapshot.address} />
        <Row label="Telepon" value={snapshot.phone} />
      </div>

      <Section title="Judul Pekerjaan">
        <p>{spk.workTitle || <em className="text-ink-400">[ Belum diisi ]</em>}</p>
      </Section>

      <Section title="Lingkup Pekerjaan">
        {scopeItems.length === 0 ? (
          <em className="text-ink-400">[ Belum ada lingkup ]</em>
        ) : (
          <ol className="list-decimal pl-5 space-y-1">
            {scopeItems.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ol>
        )}
      </Section>

      <Section title="Periode Pekerjaan">
        <p>
          {formatDate(spk.periodStart)} &mdash; {formatDate(spk.periodEnd)}
        </p>
      </Section>

      {spk.warranty && (
        <Section title="Garansi">
          <p>{spk.warranty}</p>
        </Section>
      )}

      <Section title="Ketentuan Umum">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Vendor wajib menyerahkan deliverable sesuai lingkup pekerjaan dalam periode yang disepakati.</li>
          <li>
            Hak kekayaan intelektual atas hasil pekerjaan menjadi milik Perusahaan setelah pembayaran lunas.
          </li>
          <li>Vendor terikat oleh NDA yang telah ditandatangani.</li>
          <li>Perubahan scope harus disepakati secara tertulis oleh kedua pihak.</li>
        </ol>
      </Section>

      <div className="grid grid-cols-2 gap-8 mt-10 pt-6 border-t border-ink-100">
        <SignatureBlock
          label="Pemberi Pekerjaan"
          org={company.name}
          name={company.directorName}
          title={company.directorTitle}
          signatureUrl={adminSignatureUrl}
          signedAt={spk.adminSignedAt}
        />
        <SignatureBlock
          label="Penerima Pekerjaan"
          org="Vendor"
          name={snapshot.fullName}
          title={`NIK: ${snapshot.nik}`}
          signatureUrl={vendorSignatureUrl}
          signedAt={spk.vendorSignedAt}
        />
      </div>
    </article>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] text-sm gap-2">
      <span className="text-ink-500">{label}</span>
      <span className="text-ink-800">: {value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <h3 className="font-display text-sm font-semibold text-ink-900 border-b border-ink-100 pb-1 mb-2">
        {title}
      </h3>
      <div className="text-sm">{children}</div>
    </section>
  )
}

function SignatureBlock({
  label,
  org,
  name,
  title,
  signatureUrl,
  signedAt,
}: {
  label: string
  org: string
  name: string
  title: string
  signatureUrl?: string
  signedAt: Date | null
}) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="font-bold text-sm">{org}</p>
      <div className="h-24 flex items-center justify-center my-2">
        {signatureUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={signatureUrl} alt={`TTD ${name}`} className="max-h-24 max-w-[200px] object-contain" />
        ) : (
          <span className="text-ink-300 italic text-xs">[ Menunggu tanda tangan ]</span>
        )}
      </div>
      <p className="font-bold border-t border-ink-900 pt-1 text-sm">{name}</p>
      <p className="text-xs text-ink-500">{title}</p>
      {signedAt && <p className="text-[10px] text-ink-400 italic mt-1">Ditandatangani: {formatDate(signedAt)}</p>}
    </div>
  )
}
