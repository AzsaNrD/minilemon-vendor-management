import type { NDA, CompanySettings } from '@prisma/client'
import type { VendorSnapshot } from '@/schemas/nda'
import { formatDate } from '@/lib/utils'

interface NDAPreviewProps {
  nda: NDA
  company: CompanySettings
  vendorSignatureUrl?: string
  adminSignatureUrl?: string
}

export function NDAPreview({ nda, company, vendorSignatureUrl, adminSignatureUrl }: NDAPreviewProps) {
  const snapshot = nda.vendorSnapshot as unknown as VendorSnapshot

  return (
    <article className="bg-white rounded-xl border border-ink-100 p-8 md:p-10 shadow-soft text-ink-800 font-mono leading-relaxed text-[13px]">
      <header className="border-b-2 border-ink-900 pb-3 mb-6">
        <p className="font-display text-base font-bold text-ink-900">{company.name}</p>
        <p className="text-xs text-ink-500">{company.address}</p>
        <p className="text-xs text-ink-500">
          {company.phone} &middot; {company.email}
        </p>
      </header>

      <div className="text-center mb-6">
        <h1 className="font-display text-xl font-bold tracking-wider text-ink-900">PERJANJIAN KERAHASIAAN</h1>
        <p className="font-display italic text-ink-500 text-sm">Non-Disclosure Agreement</p>
        <p className="text-xs text-ink-500 mt-1">No. {nda.docNumber}</p>
      </div>

      <p className="mb-4 text-justify">
        Perjanjian Kerahasiaan ini dibuat dan ditandatangani pada tanggal{' '}
        <strong>{formatDate(nda.effectiveDate)}</strong>, oleh dan antara:
      </p>

      <div className="grid gap-3 mb-6">
        <div className="border border-ink-100 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-ink-500 mb-1">Pihak Pertama / First Party</p>
          <p className="font-bold mb-2">{company.name}</p>
          <Row label="Alamat" value={company.address} />
          <Row label="Diwakili oleh" value={`${company.directorName} (${company.directorTitle})`} />
        </div>

        <div className="border border-ink-100 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-ink-500 mb-1">Pihak Kedua / Second Party</p>
          <p className="font-bold mb-2">{snapshot.fullName}</p>
          <Row label="NIK" value={snapshot.nik} />
          <Row label="Alamat" value={snapshot.address} />
          <Row label="Telepon" value={snapshot.phone} />
          {snapshot.companyName ? <Row label="Perusahaan" value={snapshot.companyName} /> : null}
          {snapshot.npwp ? <Row label="NPWP" value={snapshot.npwp} /> : null}
        </div>
      </div>

      <p className="mb-6 text-justify">
        Para Pihak sepakat untuk mengikatkan diri dalam Perjanjian dengan ketentuan sebagai berikut:
      </p>

      <Article number={1} title="DEFINISI">
        <p>
          <strong>&quot;Informasi Rahasia&quot;</strong> berarti seluruh informasi non-publik dalam bentuk tertulis,
          lisan, digital, atau bentuk lain, termasuk rencana bisnis, materi kreatif, aset visual, naskah, daftar
          klien, data keuangan, strategi pemasaran, kekayaan intelektual, source files, serta data pribadi yang
          diungkapkan oleh Perusahaan kepada Vendor.
        </p>
      </Article>

      <Article number={2} title="KEWAJIBAN KERAHASIAAN">
        <p>
          Vendor wajib menjaga seluruh Informasi Rahasia secara ketat dan tidak akan mengungkapkan, menyebarluaskan,
          atau mengizinkan akses kepada pihak ketiga tanpa persetujuan tertulis terlebih dahulu dari Perusahaan.
        </p>
      </Article>

      <Article number={3} title="PENGECUALIAN">
        <p>
          Kewajiban tidak berlaku untuk informasi yang telah menjadi pengetahuan publik tanpa pelanggaran, sudah
          diketahui Vendor sebelum diungkapkan, atau wajib diungkapkan berdasarkan perintah pengadilan.
        </p>
      </Article>

      <Article number={4} title="JANGKA WAKTU">
        <p>
          Perjanjian berlaku sejak ditandatangani dan tetap mengikat selama 3 (tiga) tahun setelah berakhirnya kerja
          sama, kecuali untuk rahasia dagang yang dilindungi tanpa batas waktu.
        </p>
      </Article>

      <Article number={5} title="HAK KEKAYAAN INTELEKTUAL">
        <p>
          Seluruh hak kekayaan intelektual atas hasil pekerjaan Vendor untuk Perusahaan menjadi milik Perusahaan,
          kecuali disepakati lain secara tertulis.
        </p>
      </Article>

      <Article number={6} title="PENGEMBALIAN INFORMASI">
        <p>
          Pada saat berakhirnya Perjanjian, Vendor wajib mengembalikan atau memusnahkan seluruh Informasi Rahasia,
          termasuk salinan digital dan fisik.
        </p>
      </Article>

      <Article number={7} title="LARANGAN PENYALINAN">
        <p>
          Vendor dilarang menyalin, mereproduksi, atau membuat turunan Informasi Rahasia di luar keperluan kerja,
          serta menyimpannya pada perangkat tidak aman.
        </p>
      </Article>

      <Article number={8} title="LARANGAN BERSAING">
        <p>
          Vendor dilarang menggunakan Informasi Rahasia untuk kepentingan sendiri atau kompetitor langsung
          Perusahaan dalam bidang animasi dan konten kreatif.
        </p>
      </Article>

      <Article number={9} title="PERLINDUNGAN DATA PRIBADI">
        <p>
          Vendor wajib mematuhi peraturan perlindungan data pribadi yang berlaku di Indonesia (UU PDP).
        </p>
      </Article>

      <Article number={10} title="KONSEKUENSI PELANGGARAN">
        <p>
          Pelanggaran mengakibatkan Vendor wajib mengganti seluruh kerugian Perusahaan, dan Perusahaan berhak
          mengakhiri kerja sama dengan segera tanpa kompensasi.
        </p>
      </Article>

      <Article number={11} title="HUBUNGAN HUKUM">
        <p>
          Vendor bertindak sebagai kontraktor independen dan bertanggung jawab atas pajak serta kewajiban legalnya
          sendiri. Tidak ada hubungan kerja, kemitraan, atau keagenan.
        </p>
      </Article>

      <Article number={12} title="PENYELESAIAN SENGKETA">
        <p>
          Sengketa diselesaikan secara musyawarah; jika tidak tercapai dalam 30 hari, melalui Pengadilan Negeri
          Surabaya.
        </p>
      </Article>

      <Article number={13} title="HUKUM YANG BERLAKU">
        <p>Perjanjian ini tunduk pada hukum Republik Indonesia.</p>
      </Article>

      <Article number={14} title="KETENTUAN PENUTUP">
        <p>
          Ditandatangani secara elektronik dan memiliki kekuatan hukum yang sama dengan tanda tangan basah, sesuai
          UU ITE.
        </p>
      </Article>

      <div className="grid grid-cols-2 gap-8 mt-10 pt-6 border-t border-ink-100">
        <SignatureBlock
          label="Pihak Pertama"
          org={company.name}
          name={company.directorName}
          title={company.directorTitle}
          signatureUrl={adminSignatureUrl}
          signedAt={nda.adminSignedAt}
        />
        <SignatureBlock
          label="Pihak Kedua"
          org="Vendor"
          name={snapshot.fullName}
          title={`NIK: ${snapshot.nik}`}
          signatureUrl={vendorSignatureUrl}
          signedAt={nda.vendorSignedAt}
        />
      </div>
    </article>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] text-xs gap-2 mb-0.5">
      <span className="text-ink-500">{label}</span>
      <span className="text-ink-800">: {value}</span>
    </div>
  )
}

function Article({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <h3 className="font-display text-sm font-semibold text-ink-900 border-b border-ink-100 pb-1 mb-2">
        Pasal {number} &mdash; {title}
      </h3>
      <div className="text-justify text-[12.5px] space-y-1.5">{children}</div>
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
          <img src={signatureUrl} alt={`Tanda tangan ${name}`} className="max-h-24 max-w-[200px] object-contain" />
        ) : (
          <span className="text-ink-300 italic text-xs">[ Menunggu tanda tangan ]</span>
        )}
      </div>
      <p className="font-bold border-t border-ink-900 pt-1">{name}</p>
      <p className="text-xs text-ink-500">{title}</p>
      {signedAt && <p className="text-[10px] text-ink-400 italic mt-1">Ditandatangani: {formatDate(signedAt)}</p>}
    </div>
  )
}
