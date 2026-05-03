import type { Invoice, Vendor, CompanySettings } from '@prisma/client'

interface InvoiceDocumentProps {
  invoice: Invoice
  vendor: Vendor
  company: CompanySettings
  vendorSignatureDataUrl?: string
}

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(d)
const formatIDR = (n: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n)

export function InvoiceDocument({ invoice, vendor, company, vendorSignatureDataUrl }: InvoiceDocumentProps) {
  const amount = Number(invoice.amount)

  return (
    <div className="doc">
      <div className="band">
        <div>
          <div className="doc-type">INVOICE</div>
          <div className="doc-number">{invoice.docNumber}</div>
        </div>
        <div className="company-block">
          <div className="company-name">{company.name}</div>
          <div className="company-meta">{company.address}</div>
          <div className="company-meta">
            {company.phone} &middot; {company.email}
          </div>
        </div>
      </div>

      <div className="meta-row">
        <div>
          <div className="meta-label">Dari / From</div>
          <div className="meta-value">
            <strong>{vendor.fullName}</strong>
            {vendor.companyName ? ` (${vendor.companyName})` : ''}
          </div>
          {vendor.address && <div className="meta-sub">{vendor.address}</div>}
          {vendor.phone && <div className="meta-sub">{vendor.phone}</div>}
          {vendor.npwp && <div className="meta-sub">NPWP: {vendor.npwp}</div>}
        </div>
        <div className="meta-right">
          <div className="meta-row-small">
            <span className="meta-label">Kepada</span>
            <span>: {company.name}</span>
          </div>
          <div className="meta-row-small">
            <span className="meta-label">Tanggal Invoice</span>
            <span>: {formatDate(invoice.invoiceDate)}</span>
          </div>
          {invoice.paidAt && (
            <div className="meta-row-small paid">
              <span className="meta-label">Dibayar</span>
              <span>: {formatDate(invoice.paidAt)}</span>
            </div>
          )}
        </div>
      </div>

      <table className="items">
        <thead>
          <tr>
            <th>Deskripsi</th>
            <th className="col-amount">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Pembayaran atas penyelesaian project sesuai SPK terkait. Detail terlampir pada deliverable Drive
              link.
            </td>
            <td className="col-amount">{formatIDR(amount)}</td>
          </tr>
        </tbody>
      </table>

      <div className="totals">
        <div className="totals-row total-final">
          <span>Total Tagihan</span>
          <span>{formatIDR(amount)}</span>
        </div>
      </div>

      {vendor.bankName && (
        <div className="bank">
          <div className="bank-label">Pembayaran ditujukan ke / Payment to</div>
          <div className="bank-row">
            <span>Bank</span>
            <span>: {vendor.bankName}</span>
          </div>
          <div className="bank-row">
            <span>No. Rekening</span>
            <span>: {vendor.bankAccountNo}</span>
          </div>
          <div className="bank-row">
            <span>Atas Nama</span>
            <span>: {vendor.bankAccountHolder}</span>
          </div>
        </div>
      )}

      {invoice.notes && (
        <div className="notes">
          <div className="notes-label">Catatan</div>
          <div className="notes-body">{invoice.notes}</div>
        </div>
      )}

      <div className="signature-block">
        <div className="signature-col">
          <p className="sig-label">Diterbitkan Oleh / Issued By</p>
          <p className="sig-org">Vendor</p>
          <div className="sig-image-wrap">
            {vendorSignatureDataUrl ? (
              <img src={vendorSignatureDataUrl} alt="TTD vendor" className="sig-image" />
            ) : (
              <div className="sig-placeholder">[ Menunggu tanda tangan ]</div>
            )}
          </div>
          <p className="sig-name">{vendor.fullName}</p>
          {invoice.vendorSignedAt && (
            <p className="sig-date">Ditandatangani: {formatDate(invoice.vendorSignedAt)}</p>
          )}
        </div>
      </div>

      {invoice.status !== 'APPROVED' && (
        <div className="watermark">DRAFT &mdash; Belum disetujui</div>
      )}
      {invoice.paidAt && <div className="paid-stamp">LUNAS / PAID</div>}
    </div>
  )
}

export const INVOICE_PDF_CSS = `
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #1a1814;
    font-size: 10.5pt;
    line-height: 1.45;
  }
  .band {
    background: #E06650;
    color: white;
    padding: 18px 22px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin: 0 0 18px 0;
    border-radius: 4px;
  }
  .doc-type {
    font-size: 22pt;
    font-weight: 700;
    letter-spacing: 4px;
    line-height: 1;
  }
  .doc-number { font-size: 10pt; margin-top: 4px; opacity: 0.95; }
  .company-block { text-align: right; }
  .company-name { font-weight: 700; font-size: 12pt; margin-bottom: 2px; }
  .company-meta { font-size: 9pt; opacity: 0.9; }
  .meta-row { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 18px; }
  .meta-label {
    font-size: 8.5pt;
    color: #7a7163;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .meta-value { font-size: 11pt; margin-top: 2px; }
  .meta-sub { font-size: 9pt; color: #5a5347; }
  .meta-row-small { font-size: 9.5pt; display: flex; gap: 8px; justify-content: flex-end; }
  .meta-row-small.paid { color: #3F8E4F; font-weight: 600; }
  .meta-right { text-align: right; }
  table.items { width: 100%; border-collapse: collapse; margin: 14px 0 12px 0; }
  table.items thead th {
    background: #1a1814;
    color: white;
    text-align: left;
    padding: 8px 10px;
    font-size: 9pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  table.items tbody td {
    padding: 10px;
    border-bottom: 1px solid #e0d9cc;
    font-size: 10pt;
    vertical-align: top;
  }
  .col-amount { width: 200px; text-align: right; font-weight: 600; }
  .totals {
    margin-left: auto;
    width: 320px;
    margin-bottom: 18px;
  }
  .totals-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 10px;
  }
  .totals-row.total-final {
    border-top: 2px solid #E06650;
    border-bottom: 2px solid #E06650;
    padding: 8px 10px;
    margin-top: 4px;
    font-size: 13pt;
    font-weight: 700;
    color: #C4503D;
  }
  .bank {
    background: #FBE5E0;
    border-left: 3px solid #E06650;
    padding: 10px 14px;
    margin-bottom: 14px;
    font-size: 10pt;
  }
  .bank-label {
    font-size: 8.5pt;
    color: #7a7163;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .bank-row {
    display: flex;
    gap: 6px;
  }
  .bank-row span:first-child { width: 110px; color: #5a5347; }
  .notes {
    border-left: 3px solid #FFD93D;
    padding: 8px 12px;
    background: #FFFDF0;
    margin-bottom: 18px;
    font-size: 9.5pt;
  }
  .notes-label {
    font-size: 8.5pt;
    color: #7a7163;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }
  .signature-block {
    display: flex;
    margin-top: 24px;
    page-break-inside: avoid;
  }
  .signature-col { flex: 1; max-width: 280px; text-align: center; }
  .sig-label {
    margin: 0;
    font-size: 8.5pt;
    color: #7a7163;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .sig-org { margin: 2px 0 0 0; font-weight: 700; }
  .sig-image-wrap { height: 80px; display: flex; align-items: center; justify-content: center; margin: 6px 0; }
  .sig-image { max-height: 80px; max-width: 200px; object-fit: contain; }
  .sig-placeholder { color: #c4bcae; font-style: italic; font-size: 9pt; }
  .sig-name { margin: 0; border-top: 1px solid #1a1814; padding-top: 4px; font-weight: 700; }
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
  .paid-stamp {
    position: fixed;
    top: 60mm;
    right: 30mm;
    transform: rotate(-15deg);
    border: 4px solid #3F8E4F;
    color: #3F8E4F;
    padding: 8px 24px;
    font-size: 22pt;
    font-weight: 700;
    letter-spacing: 4px;
    opacity: 0.7;
  }
`
