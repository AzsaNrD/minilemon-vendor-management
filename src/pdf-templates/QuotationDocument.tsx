import type { Quotation, Vendor, CompanySettings } from '@prisma/client'
import type { QuotationItemInput } from '@/schemas/quotation'

interface QuotationDocumentProps {
  quotation: Quotation
  vendor: Vendor
  company: CompanySettings
  vendorSignatureDataUrl?: string
  adminSignatureDataUrl?: string
}

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(d)
const formatIDR = (n: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n)

export function QuotationDocument({
  quotation,
  vendor,
  company,
  vendorSignatureDataUrl,
  adminSignatureDataUrl,
}: QuotationDocumentProps) {
  const items = quotation.items as unknown as QuotationItemInput[]
  const subtotal = Number(quotation.subtotal)
  const discount = Number(quotation.discount)
  const ppn = Number(quotation.ppn)
  const grandTotal = Number(quotation.grandTotal)

  return (
    <div className="doc">
      <div className="band">
        <div>
          <div className="doc-type">QUOTATION</div>
          <div className="doc-number">{quotation.docNumber}</div>
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
          <div className="meta-label">Kepada / To</div>
          <div className="meta-value">
            <strong>{vendor.fullName}</strong>
            {vendor.companyName ? ` (${vendor.companyName})` : ''}
          </div>
          {vendor.address && <div className="meta-sub">{vendor.address}</div>}
          {vendor.phone && <div className="meta-sub">{vendor.phone}</div>}
        </div>
        <div className="meta-right">
          <div className="meta-row-small">
            <span className="meta-label">Tanggal</span>
            <span>: {formatDate(quotation.date)}</span>
          </div>
          <div className="meta-row-small">
            <span className="meta-label">Berlaku sampai</span>
            <span>: {formatDate(quotation.validityUntil)}</span>
          </div>
          <div className="meta-row-small">
            <span className="meta-label">Versi</span>
            <span>: {quotation.version}</span>
          </div>
        </div>
      </div>

      <table className="items">
        <thead>
          <tr>
            <th className="col-no">No</th>
            <th className="col-desc">Deskripsi</th>
            <th className="col-qty">Qty</th>
            <th className="col-price">Harga Satuan</th>
            <th className="col-total">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td className="col-no">{i + 1}</td>
              <td className="col-desc">{it.description}</td>
              <td className="col-qty">{it.qty}</td>
              <td className="col-price">{formatIDR(it.price)}</td>
              <td className="col-total">{formatIDR(it.price * it.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totals">
        <div className="totals-row">
          <span>Subtotal</span>
          <span>{formatIDR(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="totals-row">
            <span>Diskon</span>
            <span>-{formatIDR(discount)}</span>
          </div>
        )}
        {quotation.ppnEnabled && (
          <div className="totals-row">
            <span>PPN ({Number(quotation.ppnPercent)}%)</span>
            <span>{formatIDR(ppn)}</span>
          </div>
        )}
        <div className="totals-row total-final">
          <span>Grand Total</span>
          <span>{formatIDR(grandTotal)}</span>
        </div>
      </div>

      {quotation.notes && (
        <div className="notes">
          <div className="notes-label">Catatan</div>
          <div className="notes-body">{quotation.notes}</div>
        </div>
      )}

      <div className="signature-block">
        <div className="signature-col">
          <p className="sig-label">Disetujui Oleh / Approved By</p>
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
          {quotation.adminSignedAt && <p className="sig-date">Ditandatangani: {formatDate(quotation.adminSignedAt)}</p>}
        </div>
        <div className="signature-col">
          <p className="sig-label">Diajukan Oleh / Submitted By</p>
          <p className="sig-org">Vendor</p>
          <div className="sig-image-wrap">
            {vendorSignatureDataUrl ? (
              <img src={vendorSignatureDataUrl} alt="TTD vendor" className="sig-image" />
            ) : (
              <div className="sig-placeholder">[ Menunggu tanda tangan ]</div>
            )}
          </div>
          <p className="sig-name">{vendor.fullName}</p>
          <p className="sig-title">{vendor.companyName || 'Vendor Independen'}</p>
          {quotation.vendorSignedAt && (
            <p className="sig-date">Ditandatangani: {formatDate(quotation.vendorSignedAt)}</p>
          )}
        </div>
      </div>

      {quotation.status !== 'SIGNED' && (
        <div className="watermark">DRAFT &mdash; Belum berlaku sampai ditandatangani Kedua Pihak</div>
      )}
    </div>
  )
}

export const QUOTATION_PDF_CSS = `
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
    background: #3F8E4F;
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
  .doc-number {
    font-size: 10pt;
    margin-top: 4px;
    opacity: 0.9;
  }
  .company-block {
    text-align: right;
  }
  .company-name {
    font-weight: 700;
    font-size: 12pt;
    margin-bottom: 2px;
  }
  .company-meta {
    font-size: 9pt;
    opacity: 0.85;
  }
  .meta-row {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 18px;
  }
  .meta-label {
    font-size: 8.5pt;
    color: #7a7163;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .meta-value { font-size: 11pt; margin-top: 2px; }
  .meta-sub { font-size: 9pt; color: #5a5347; }
  .meta-row-small { font-size: 9.5pt; display: flex; gap: 8px; }
  .meta-right { text-align: right; }
  .meta-right .meta-row-small { justify-content: flex-end; }
  table.items {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 18px 0;
  }
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
    padding: 8px 10px;
    border-bottom: 1px solid #e0d9cc;
    font-size: 10pt;
    vertical-align: top;
  }
  .col-no { width: 28px; text-align: center; }
  .col-desc { }
  .col-qty { width: 50px; text-align: center; }
  .col-price { width: 130px; text-align: right; }
  .col-total { width: 140px; text-align: right; font-weight: 600; }
  .totals {
    margin-left: auto;
    width: 320px;
    margin-bottom: 18px;
  }
  .totals-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 10px;
    font-size: 10pt;
  }
  .totals-row.total-final {
    border-top: 2px solid #1a1814;
    padding-top: 6px;
    margin-top: 4px;
    font-size: 12pt;
    font-weight: 700;
  }
  .notes {
    border-left: 3px solid #FFD93D;
    padding: 8px 12px;
    background: #FFFDF0;
    margin-bottom: 22px;
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
    gap: 30px;
    margin-top: 30px;
    page-break-inside: avoid;
  }
  .signature-col { flex: 1; text-align: center; }
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
