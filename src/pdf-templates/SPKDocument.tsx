import type { SPK, CompanySettings } from '@prisma/client'
import type { VendorSnapshot } from '@/schemas/nda'

interface SPKDocumentProps {
  spk: SPK
  company: CompanySettings
  vendorSignatureDataUrl?: string
  adminSignatureDataUrl?: string
}

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(d)

export function SPKDocument({ spk, company, vendorSignatureDataUrl, adminSignatureDataUrl }: SPKDocumentProps) {
  const snapshot = spk.vendorSnapshot as unknown as VendorSnapshot
  const scopeItems = (spk.scopeItems as unknown as string[]) || []

  return (
    <div className="doc">
      <header className="doc-header">
        <div className="company-name">{company.name}</div>
        <div className="company-meta">{company.address}</div>
        <div className="company-meta">
          {company.phone} &middot; {company.email}
        </div>
      </header>

      <div className="doc-title">
        <h1>SURAT PERINTAH KERJA</h1>
        <p className="doc-number">No. {spk.docNumber}</p>
      </div>

      <p className="intro">
        Yang bertanda tangan di bawah ini, atas nama <strong>{company.name}</strong> dengan ini memberikan
        perintah kerja kepada:
      </p>

      <div className="party">
        <table className="party-meta">
          <tbody>
            <tr>
              <td>Nama</td>
              <td>: {snapshot.fullName}</td>
            </tr>
            {snapshot.companyName && (
              <tr>
                <td>Perusahaan</td>
                <td>: {snapshot.companyName}</td>
              </tr>
            )}
            <tr>
              <td>NIK</td>
              <td>: {snapshot.nik}</td>
            </tr>
            <tr>
              <td>Alamat</td>
              <td>: {snapshot.address}</td>
            </tr>
            <tr>
              <td>Telepon</td>
              <td>: {snapshot.phone}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="recital">
        Untuk melaksanakan pekerjaan dengan ketentuan sebagai berikut:
      </p>

      <Section title="Judul Pekerjaan">
        <p>{spk.workTitle}</p>
      </Section>

      <Section title="Lingkup Pekerjaan">
        <ol className="scope-list">
          {scopeItems.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      </Section>

      <Section title="Periode Pekerjaan">
        <p>
          {formatDate(spk.periodStart)} &mdash; {formatDate(spk.periodEnd)}
        </p>
      </Section>

      {spk.warranty && (
        <Section title="Garansi / Warranty">
          <p>{spk.warranty}</p>
        </Section>
      )}

      <Section title="Ketentuan Pembayaran">
        <p>
          Pembayaran dilakukan sesuai dengan Quotation yang telah disetujui kedua pihak. Vendor wajib
          mengirimkan invoice setelah deliverable diserahkan dan disetujui Perusahaan.
        </p>
      </Section>

      <Section title="Ketentuan Umum">
        <ol className="terms">
          <li>
            Vendor wajib menyerahkan deliverable sesuai lingkup pekerjaan dalam periode yang disepakati.
          </li>
          <li>
            Seluruh hak kekayaan intelektual atas hasil pekerjaan menjadi milik Perusahaan setelah pembayaran
            lunas.
          </li>
          <li>
            Vendor terikat oleh NDA yang telah ditandatangani dan wajib menjaga kerahasiaan seluruh informasi
            terkait project.
          </li>
          <li>
            Perubahan scope di luar yang tertulis pada SPK ini harus disepakati secara tertulis oleh kedua pihak.
          </li>
        </ol>
      </Section>

      <p className="closing">
        SPK ini ditandatangani secara elektronik oleh kedua pihak dan memiliki kekuatan hukum yang sama dengan
        tanda tangan basah.
      </p>

      <div className="signature-block">
        <div className="signature-col">
          <p className="sig-label">Pemberi Pekerjaan</p>
          <p className="sig-org">{company.name}</p>
          <div className="sig-image-wrap">
            {adminSignatureDataUrl ? (
              <img src={adminSignatureDataUrl} alt="TTD admin" className="sig-image" />
            ) : (
              <div className="sig-placeholder">[ Menunggu tanda tangan ]</div>
            )}
          </div>
          <p className="sig-name">{company.directorName}</p>
          <p className="sig-title">{company.directorTitle}</p>
          {spk.adminSignedAt && <p className="sig-date">Ditandatangani: {formatDate(spk.adminSignedAt)}</p>}
        </div>
        <div className="signature-col">
          <p className="sig-label">Penerima Pekerjaan</p>
          <p className="sig-org">Vendor</p>
          <div className="sig-image-wrap">
            {vendorSignatureDataUrl ? (
              <img src={vendorSignatureDataUrl} alt="TTD vendor" className="sig-image" />
            ) : (
              <div className="sig-placeholder">[ Menunggu tanda tangan ]</div>
            )}
          </div>
          <p className="sig-name">{snapshot.fullName}</p>
          <p className="sig-title">NIK: {snapshot.nik}</p>
          {spk.vendorSignedAt && <p className="sig-date">Ditandatangani: {formatDate(spk.vendorSignedAt)}</p>}
        </div>
      </div>

      {spk.status !== 'SIGNED' && (
        <div className="watermark">DRAFT &mdash; Belum berlaku sampai ditandatangani Kedua Pihak</div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <h3 className="section-title">{title}</h3>
      <div className="section-body">{children}</div>
    </section>
  )
}

export const SPK_PDF_CSS = `
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: 'Times New Roman', Times, serif;
    color: #1a1814;
    font-size: 11pt;
    line-height: 1.5;
  }
  .doc-header {
    border-bottom: 2px solid #1a1814;
    padding-bottom: 10px;
    margin-bottom: 18px;
  }
  .company-name { font-size: 13pt; font-weight: bold; }
  .company-meta { font-size: 9pt; color: #5a5347; }
  .doc-title {
    text-align: center;
    margin: 22px 0 18px 0;
  }
  .doc-title h1 {
    font-size: 16pt;
    margin: 0 0 4px 0;
    letter-spacing: 1px;
  }
  .doc-number { font-size: 10pt; color: #5a5347; margin: 4px 0 0 0; }
  .intro, .recital, .closing {
    text-align: justify;
    margin-bottom: 14px;
  }
  .closing { font-style: italic; color: #5a5347; font-size: 10pt; margin-top: 18px; }
  .party {
    border: 1px solid #e0d9cc;
    padding: 10px 14px;
    border-radius: 4px;
    margin-bottom: 14px;
  }
  .party-meta {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
  }
  .party-meta td:first-child { width: 110px; color: #5a5347; padding: 2px 0; }
  .section { margin-bottom: 14px; page-break-inside: avoid; }
  .section-title {
    font-size: 11pt;
    font-weight: bold;
    margin: 0 0 6px 0;
    border-bottom: 1px solid #e0d9cc;
    padding-bottom: 3px;
  }
  .section-body p { margin: 0 0 4px 0; }
  .scope-list, .terms {
    margin: 0;
    padding-left: 22px;
  }
  .scope-list li, .terms li {
    margin-bottom: 4px;
    text-align: justify;
  }
  .signature-block {
    display: flex;
    gap: 30px;
    margin-top: 30px;
    page-break-inside: avoid;
  }
  .signature-col { flex: 1; text-align: center; }
  .sig-label {
    margin: 0;
    font-size: 9pt;
    color: #7a7163;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .sig-org { margin: 2px 0 0 0; font-weight: bold; }
  .sig-image-wrap { height: 90px; display: flex; align-items: center; justify-content: center; margin: 6px 0; }
  .sig-image { max-height: 90px; max-width: 200px; object-fit: contain; }
  .sig-placeholder { color: #c4bcae; font-style: italic; font-size: 9pt; }
  .sig-name { margin: 0; border-top: 1px solid #1a1814; padding-top: 4px; font-weight: bold; }
  .sig-title { margin: 2px 0 0 0; font-size: 9pt; color: #5a5347; }
  .sig-date { margin: 4px 0 0 0; font-size: 8.5pt; color: #7a7163; font-style: italic; }
  .watermark {
    position: fixed;
    bottom: 8mm;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 9pt;
    color: #c4bcae;
    letter-spacing: 1px;
  }
`
