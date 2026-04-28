interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  directorName: string
  directorTitle: string
}

interface VendorSnapshot {
  fullName: string
  nik: string
  address: string
  phone: string
  companyName?: string | null
  npwp?: string | null
}

interface NDADocumentProps {
  docNumber: string
  effectiveDate: Date
  vendor: VendorSnapshot
  company: CompanyInfo
  vendorSignatureDataUrl?: string
  adminSignatureDataUrl?: string
  vendorSignedAt?: Date | null
  adminSignedAt?: Date | null
  status: 'PENDING_VENDOR_SIGN' | 'PENDING_ADMIN_SIGN' | 'SIGNED'
}

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(d)

export function NDADocument({
  docNumber,
  effectiveDate,
  vendor,
  company,
  vendorSignatureDataUrl,
  adminSignatureDataUrl,
  vendorSignedAt,
  adminSignedAt,
  status,
}: NDADocumentProps) {
  return (
    <div className="doc">
      <header className="doc-header">
        <div className="company">
          <div className="company-name">{company.name}</div>
          <div className="company-meta">{company.address}</div>
          <div className="company-meta">
            {company.phone} &middot; {company.email}
          </div>
        </div>
      </header>

      <div className="doc-title">
        <h1>PERJANJIAN KERAHASIAAN</h1>
        <h2>Non-Disclosure Agreement</h2>
        <p className="doc-number">No. {docNumber}</p>
      </div>

      <p className="intro">
        Perjanjian Kerahasiaan ini (selanjutnya disebut <strong>&quot;Perjanjian&quot;</strong>) dibuat dan ditandatangani
        pada tanggal {formatDate(effectiveDate)}, oleh dan antara:
        <br />
        <em>
          This Non-Disclosure Agreement (the <strong>&quot;Agreement&quot;</strong>) is made and entered into on{' '}
          {formatDate(effectiveDate)}, by and between:
        </em>
      </p>

      <div className="parties">
        <div className="party">
          <div className="party-label">PIHAK PERTAMA / FIRST PARTY</div>
          <div className="party-name">{company.name}</div>
          <table className="party-meta">
            <tbody>
              <tr>
                <td>Alamat / Address</td>
                <td>: {company.address}</td>
              </tr>
              <tr>
                <td>Diwakili oleh / Represented by</td>
                <td>
                  : {company.directorName} ({company.directorTitle})
                </td>
              </tr>
            </tbody>
          </table>
          <p className="party-role">
            Selanjutnya disebut sebagai <strong>&quot;Perusahaan&quot;</strong> /{' '}
            <em>Hereinafter referred to as the &quot;Company&quot;</em>
          </p>
        </div>

        <div className="party">
          <div className="party-label">PIHAK KEDUA / SECOND PARTY</div>
          <div className="party-name">{vendor.fullName}</div>
          <table className="party-meta">
            <tbody>
              <tr>
                <td>NIK</td>
                <td>: {vendor.nik}</td>
              </tr>
              <tr>
                <td>Alamat / Address</td>
                <td>: {vendor.address}</td>
              </tr>
              <tr>
                <td>Telepon / Phone</td>
                <td>: {vendor.phone}</td>
              </tr>
              {vendor.companyName ? (
                <tr>
                  <td>Perusahaan / Company</td>
                  <td>: {vendor.companyName}</td>
                </tr>
              ) : null}
              {vendor.npwp ? (
                <tr>
                  <td>NPWP</td>
                  <td>: {vendor.npwp}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
          <p className="party-role">
            Selanjutnya disebut sebagai <strong>&quot;Vendor&quot;</strong> /{' '}
            <em>Hereinafter referred to as the &quot;Vendor&quot;</em>
          </p>
        </div>
      </div>

      <p className="recital">
        Perusahaan dan Vendor secara bersama-sama disebut &quot;Para Pihak&quot; dan secara sendiri-sendiri disebut
        &quot;Pihak&quot;. Para Pihak sepakat untuk mengikatkan diri dalam Perjanjian dengan ketentuan sebagai berikut:
        <br />
        <em>
          The Company and the Vendor are collectively referred to as the &quot;Parties&quot; and individually as a
          &quot;Party&quot;. The Parties agree to be bound by this Agreement under the following terms:
        </em>
      </p>

      <Article number={1} titleId="DEFINISI" titleEn="Definitions">
        <p>
          <strong>&quot;Informasi Rahasia&quot;</strong> berarti seluruh informasi non-publik dalam bentuk tertulis,
          lisan, digital, atau bentuk lain, termasuk namun tidak terbatas pada: rencana bisnis, materi kreatif,
          aset visual, naskah, daftar klien, data keuangan, strategi pemasaran, kekayaan intelektual, source files,
          serta data pribadi yang diungkapkan oleh Perusahaan kepada Vendor sehubungan dengan Perjanjian ini.
        </p>
        <p>
          <em>
            <strong>&quot;Confidential Information&quot;</strong> means all non-public information in written, oral,
            digital, or other forms, including but not limited to: business plans, creative materials, visual
            assets, scripts, client lists, financial data, marketing strategies, intellectual property, source files,
            and personal data disclosed by the Company to the Vendor in connection with this Agreement.
          </em>
        </p>
      </Article>

      <Article number={2} titleId="KEWAJIBAN KERAHASIAAN" titleEn="Confidentiality Obligations">
        <p>
          Vendor wajib menjaga seluruh Informasi Rahasia secara ketat dan tidak akan mengungkapkan, menyebarluaskan,
          atau mengizinkan akses kepada pihak ketiga tanpa persetujuan tertulis terlebih dahulu dari Perusahaan.
          Vendor harus menggunakan Informasi Rahasia semata-mata untuk tujuan pelaksanaan kerja sama dengan
          Perusahaan.
        </p>
        <p>
          <em>
            The Vendor shall maintain all Confidential Information in strict confidence and shall not disclose,
            distribute, or permit access by any third party without prior written consent from the Company. The
            Vendor must use Confidential Information solely for the purpose of performing services for the Company.
          </em>
        </p>
      </Article>

      <Article number={3} titleId="PENGECUALIAN" titleEn="Exceptions">
        <p>
          Kewajiban kerahasiaan tidak berlaku terhadap informasi yang: (a) telah menjadi pengetahuan publik tanpa
          pelanggaran Perjanjian; (b) sudah diketahui Vendor sebelum diungkapkan oleh Perusahaan; atau (c) wajib
          diungkapkan berdasarkan perintah pengadilan atau peraturan perundang-undangan yang berlaku, dengan
          pemberitahuan terlebih dahulu kepada Perusahaan.
        </p>
        <p>
          <em>
            Confidentiality obligations shall not apply to information that: (a) becomes publicly known without
            breach of this Agreement; (b) was known to the Vendor prior to disclosure by the Company; or (c) is
            required to be disclosed under court order or applicable law, with prior notice to the Company.
          </em>
        </p>
      </Article>

      <Article number={4} titleId="JANGKA WAKTU" titleEn="Term">
        <p>
          Perjanjian ini berlaku sejak tanggal ditandatangani dan akan tetap mengikat selama 3 (tiga) tahun setelah
          berakhirnya kerja sama antara Para Pihak, kecuali untuk informasi yang merupakan rahasia dagang yang
          tetap dilindungi tanpa batas waktu.
        </p>
        <p>
          <em>
            This Agreement is effective from the date of signing and shall remain binding for 3 (three) years after
            the termination of the Parties&apos; engagement, except for trade secrets which remain protected
            indefinitely.
          </em>
        </p>
      </Article>

      <Article number={5} titleId="HAK KEKAYAAN INTELEKTUAL" titleEn="Intellectual Property">
        <p>
          Seluruh hak kekayaan intelektual atas karya, materi, atau hasil pekerjaan yang dibuat oleh Vendor untuk
          Perusahaan dalam rangka kerja sama ini sepenuhnya menjadi milik Perusahaan, kecuali disepakati lain
          secara tertulis. Vendor menjamin bahwa hasil pekerjaan tidak melanggar hak pihak ketiga manapun.
        </p>
        <p>
          <em>
            All intellectual property rights to works, materials, or deliverables created by the Vendor for the
            Company in the course of this engagement shall be fully owned by the Company, unless otherwise agreed
            in writing. The Vendor warrants that deliverables do not infringe any third-party rights.
          </em>
        </p>
      </Article>

      <Article number={6} titleId="PENGEMBALIAN INFORMASI" titleEn="Return of Information">
        <p>
          Pada saat berakhirnya Perjanjian atau kapan pun atas permintaan Perusahaan, Vendor wajib mengembalikan
          atau memusnahkan seluruh Informasi Rahasia yang berada dalam penguasaannya, termasuk seluruh salinan
          digital dan fisik, serta memberikan konfirmasi tertulis atas pemusnahan tersebut.
        </p>
        <p>
          <em>
            Upon termination of this Agreement or at any time upon the Company&apos;s request, the Vendor shall
            return or destroy all Confidential Information in its possession, including all digital and physical
            copies, and provide written confirmation of such destruction.
          </em>
        </p>
      </Article>

      <Article number={7} titleId="LARANGAN PENYALINAN" titleEn="No Reproduction">
        <p>
          Vendor dilarang menyalin, mereproduksi, atau membuat turunan dari Informasi Rahasia di luar keperluan
          pelaksanaan kerja sama, dan dilarang menyimpan Informasi Rahasia pada perangkat atau layanan pihak
          ketiga yang tidak aman.
        </p>
        <p>
          <em>
            The Vendor is prohibited from copying, reproducing, or creating derivatives of Confidential Information
            beyond what is required for the engagement, and shall not store Confidential Information on insecure
            third-party devices or services.
          </em>
        </p>
      </Article>

      <Article number={8} titleId="LARANGAN BERSAING" titleEn="Non-Compete">
        <p>
          Selama jangka waktu Perjanjian, Vendor dilarang menggunakan Informasi Rahasia untuk kepentingan diri
          sendiri atau pihak ketiga yang merupakan kompetitor langsung Perusahaan dalam bidang animasi, konten
          kreatif, dan layanan terkait.
        </p>
        <p>
          <em>
            During the term of this Agreement, the Vendor shall not use Confidential Information for its own
            benefit or for any third party that is a direct competitor of the Company in animation, creative
            content, and related services.
          </em>
        </p>
      </Article>

      <Article number={9} titleId="PERLINDUNGAN DATA PRIBADI" titleEn="Personal Data Protection">
        <p>
          Vendor berkomitmen untuk mematuhi peraturan perlindungan data pribadi yang berlaku di Indonesia,
          termasuk Undang-Undang Pelindungan Data Pribadi, dalam memproses setiap data pribadi yang diterima
          dari Perusahaan.
        </p>
        <p>
          <em>
            The Vendor commits to comply with applicable personal data protection regulations in Indonesia,
            including the Personal Data Protection Law, in processing any personal data received from the Company.
          </em>
        </p>
      </Article>

      <Article number={10} titleId="KONSEKUENSI PELANGGARAN" titleEn="Consequences of Breach">
        <p>
          Pelanggaran terhadap Perjanjian ini akan mengakibatkan Vendor wajib mengganti seluruh kerugian yang
          diderita Perusahaan, termasuk kerugian langsung, tidak langsung, biaya hukum, dan reputasi. Perusahaan
          berhak mengakhiri kerja sama dengan segera tanpa kompensasi.
        </p>
        <p>
          <em>
            Any breach of this Agreement shall obligate the Vendor to indemnify the Company for all losses
            suffered, including direct, indirect, legal costs, and reputational damages. The Company reserves
            the right to terminate the engagement immediately without compensation.
          </em>
        </p>
      </Article>

      <Article number={11} titleId="HUBUNGAN HUKUM" titleEn="Legal Relationship">
        <p>
          Perjanjian ini tidak menciptakan hubungan kerja, kemitraan, joint venture, atau keagenan antara Para
          Pihak. Vendor bertindak sebagai kontraktor independen dan bertanggung jawab atas pajak serta kewajiban
          legalnya sendiri.
        </p>
        <p>
          <em>
            This Agreement does not create an employment relationship, partnership, joint venture, or agency
            between the Parties. The Vendor acts as an independent contractor and is responsible for its own
            taxes and legal obligations.
          </em>
        </p>
      </Article>

      <Article number={12} titleId="PENYELESAIAN SENGKETA" titleEn="Dispute Resolution">
        <p>
          Setiap sengketa yang timbul dari Perjanjian ini akan diselesaikan secara musyawarah. Apabila tidak
          tercapai penyelesaian dalam 30 (tiga puluh) hari, Para Pihak sepakat untuk menyelesaikannya melalui
          Pengadilan Negeri Surabaya.
        </p>
        <p>
          <em>
            Any disputes arising from this Agreement shall be resolved amicably. If unresolved within 30 (thirty)
            days, the Parties agree to settle the matter at the District Court of Surabaya.
          </em>
        </p>
      </Article>

      <Article number={13} titleId="HUKUM YANG BERLAKU" titleEn="Governing Law">
        <p>
          Perjanjian ini tunduk pada dan ditafsirkan berdasarkan hukum Republik Indonesia.
        </p>
        <p>
          <em>This Agreement shall be governed by and construed in accordance with the laws of the Republic of Indonesia.</em>
        </p>
      </Article>

      <Article number={14} titleId="KETENTUAN PENUTUP" titleEn="Final Provisions">
        <p>
          Perjanjian ini ditandatangani secara elektronik oleh Para Pihak dan memiliki kekuatan hukum yang sama
          dengan tanda tangan basah, sesuai dengan UU Informasi dan Transaksi Elektronik. Hal-hal yang belum
          diatur dalam Perjanjian ini akan diatur lebih lanjut dalam adendum tersendiri.
        </p>
        <p>
          <em>
            This Agreement is signed electronically by the Parties and has the same legal force as a wet signature,
            in accordance with the Electronic Information and Transactions Law. Matters not yet regulated herein
            shall be governed by separate addenda.
          </em>
        </p>
      </Article>

      <div className="signature-block">
        <div className="signature-col">
          <p className="sig-label">Pihak Pertama / First Party</p>
          <p className="sig-org">{company.name}</p>
          <div className="sig-image-wrap">
            {adminSignatureDataUrl ? (
              <img src={adminSignatureDataUrl} alt="Tanda tangan admin" className="sig-image" />
            ) : (
              <div className="sig-placeholder">[ Menunggu tanda tangan ]</div>
            )}
          </div>
          <p className="sig-name">{company.directorName}</p>
          <p className="sig-title">{company.directorTitle}</p>
          {adminSignedAt && <p className="sig-date">Ditandatangani: {formatDate(adminSignedAt)}</p>}
        </div>
        <div className="signature-col">
          <p className="sig-label">Pihak Kedua / Second Party</p>
          <p className="sig-org">Vendor</p>
          <div className="sig-image-wrap">
            {vendorSignatureDataUrl ? (
              <img src={vendorSignatureDataUrl} alt="Tanda tangan vendor" className="sig-image" />
            ) : (
              <div className="sig-placeholder">[ Menunggu tanda tangan ]</div>
            )}
          </div>
          <p className="sig-name">{vendor.fullName}</p>
          <p className="sig-title">NIK: {vendor.nik}</p>
          {vendorSignedAt && <p className="sig-date">Ditandatangani: {formatDate(vendorSignedAt)}</p>}
        </div>
      </div>

      {status !== 'SIGNED' && (
        <div className="watermark">DRAFT &mdash; Belum berlaku sampai ditandatangani Kedua Pihak</div>
      )}
    </div>
  )
}

interface ArticleProps {
  number: number
  titleId: string
  titleEn: string
  children: React.ReactNode
}

function Article({ number, titleId, titleEn, children }: ArticleProps) {
  return (
    <section className="article">
      <h3 className="article-title">
        Pasal {number} &mdash; {titleId}
        <br />
        <span className="article-title-en">
          Article {number} &mdash; {titleEn}
        </span>
      </h3>
      <div className="article-body">{children}</div>
    </section>
  )
}

export const NDA_PDF_CSS = `
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: 'Times New Roman', Times, serif;
    color: #1a1814;
    font-size: 10.5pt;
    line-height: 1.5;
  }
  .doc { padding: 0; }
  .doc-header {
    border-bottom: 2px solid #1a1814;
    padding-bottom: 10px;
    margin-bottom: 18px;
  }
  .company-name {
    font-size: 13pt;
    font-weight: bold;
    color: #1a1814;
  }
  .company-meta {
    font-size: 9pt;
    color: #5a5347;
  }
  .doc-title {
    text-align: center;
    margin: 22px 0 18px 0;
  }
  .doc-title h1 {
    font-size: 16pt;
    margin: 0 0 4px 0;
    letter-spacing: 1px;
  }
  .doc-title h2 {
    font-size: 11pt;
    margin: 0 0 8px 0;
    font-weight: normal;
    font-style: italic;
    color: #5a5347;
  }
  .doc-number {
    font-size: 10pt;
    color: #5a5347;
    margin: 0;
  }
  .intro, .recital {
    text-align: justify;
    margin-bottom: 14px;
  }
  .parties {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 18px;
  }
  .party {
    border: 1px solid #e0d9cc;
    padding: 10px 14px;
    border-radius: 4px;
  }
  .party-label {
    font-size: 9pt;
    color: #7a7163;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .party-name {
    font-weight: bold;
    font-size: 11pt;
    margin-bottom: 6px;
  }
  .party-meta {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
  }
  .party-meta td:first-child {
    width: 200px;
    color: #5a5347;
    vertical-align: top;
    padding: 2px 0;
  }
  .party-meta td:last-child {
    padding: 2px 0;
  }
  .party-role {
    font-size: 9.5pt;
    margin: 6px 0 0 0;
    color: #3f3a30;
  }
  .article {
    margin-bottom: 14px;
    page-break-inside: avoid;
  }
  .article-title {
    font-size: 11pt;
    font-weight: bold;
    margin: 0 0 6px 0;
    color: #1a1814;
    border-bottom: 1px solid #e0d9cc;
    padding-bottom: 3px;
  }
  .article-title-en {
    font-style: italic;
    font-weight: normal;
    color: #5a5347;
    font-size: 9.5pt;
  }
  .article-body p {
    text-align: justify;
    margin: 0 0 6px 0;
  }
  .article-body em {
    color: #5a5347;
  }
  .signature-block {
    display: flex;
    gap: 30px;
    margin-top: 36px;
    page-break-inside: avoid;
  }
  .signature-col {
    flex: 1;
    text-align: center;
  }
  .sig-label {
    margin: 0;
    font-size: 9pt;
    color: #7a7163;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .sig-org {
    margin: 2px 0 0 0;
    font-weight: bold;
  }
  .sig-image-wrap {
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 8px 0;
  }
  .sig-image {
    max-height: 96px;
    max-width: 200px;
    object-fit: contain;
  }
  .sig-placeholder {
    color: #c4bcae;
    font-style: italic;
    font-size: 9pt;
  }
  .sig-name {
    margin: 0;
    border-top: 1px solid #1a1814;
    padding-top: 4px;
    font-weight: bold;
  }
  .sig-title {
    margin: 2px 0 0 0;
    font-size: 9pt;
    color: #5a5347;
  }
  .sig-date {
    margin: 4px 0 0 0;
    font-size: 8.5pt;
    color: #7a7163;
    font-style: italic;
  }
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
