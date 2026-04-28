import type { Quotation, Vendor, CompanySettings } from '@prisma/client'
import type { QuotationItemInput } from '@/schemas/quotation'
import { formatDate, formatIDR } from '@/lib/utils'

interface QuotationPreviewProps {
  quotation: Quotation
  vendor: Vendor
  company: CompanySettings
  vendorSignatureUrl?: string
  adminSignatureUrl?: string
}

export function QuotationPreview({
  quotation,
  vendor,
  company,
  vendorSignatureUrl,
  adminSignatureUrl,
}: QuotationPreviewProps) {
  const items = quotation.items as unknown as QuotationItemInput[]
  const subtotal = Number(quotation.subtotal)
  const discount = Number(quotation.discount)
  const ppn = Number(quotation.ppn)
  const grandTotal = Number(quotation.grandTotal)

  return (
    <article className="bg-white rounded-xl border border-ink-100 shadow-soft overflow-hidden">
      <div className="bg-leaf-500 text-white px-6 py-5 flex items-end justify-between">
        <div>
          <p className="font-display text-2xl font-bold tracking-widest">QUOTATION</p>
          <p className="text-xs opacity-90 font-mono mt-0.5">{quotation.docNumber}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-bold">{company.name}</p>
          <p className="text-xs opacity-90">{company.address}</p>
          <p className="text-xs opacity-90">
            {company.phone} &middot; {company.email}
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Kepada</p>
            <p className="font-bold text-ink-900 mt-1">
              {vendor.fullName}
              {vendor.companyName ? ` (${vendor.companyName})` : ''}
            </p>
            {vendor.address && <p className="text-sm text-ink-600">{vendor.address}</p>}
            {vendor.phone && <p className="text-sm text-ink-600">{vendor.phone}</p>}
          </div>
          <div className="text-right text-sm space-y-0.5">
            <Row label="Tanggal" value={formatDate(quotation.date)} />
            <Row label="Berlaku sampai" value={formatDate(quotation.validityUntil)} />
            <Row label="Versi" value={`v${quotation.version}`} />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-ink-100">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-white text-xs uppercase tracking-wide">
              <tr>
                <th className="text-center font-medium px-3 py-2 w-10">No</th>
                <th className="text-left font-medium px-3 py-2">Deskripsi</th>
                <th className="text-center font-medium px-3 py-2 w-16">Qty</th>
                <th className="text-right font-medium px-3 py-2 w-32">Harga</th>
                <th className="text-right font-medium px-3 py-2 w-32">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {items.map((it, i) => (
                <tr key={i} className="bg-white">
                  <td className="text-center px-3 py-2 text-ink-500">{i + 1}</td>
                  <td className="px-3 py-2 text-ink-800">{it.description}</td>
                  <td className="text-center px-3 py-2 text-ink-700">{it.qty}</td>
                  <td className="text-right px-3 py-2 text-ink-700">{formatIDR(it.price)}</td>
                  <td className="text-right px-3 py-2 font-medium text-ink-900">{formatIDR(it.price * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between px-3 py-1">
            <span className="text-ink-600">Subtotal</span>
            <span>{formatIDR(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between px-3 py-1 text-coral-600">
              <span>Diskon</span>
              <span>-{formatIDR(discount)}</span>
            </div>
          )}
          {quotation.ppnEnabled && (
            <div className="flex justify-between px-3 py-1">
              <span className="text-ink-600">PPN ({Number(quotation.ppnPercent)}%)</span>
              <span>{formatIDR(ppn)}</span>
            </div>
          )}
          <div className="flex justify-between px-3 py-2 border-t-2 border-ink-900 font-display text-lg font-bold">
            <span>Grand Total</span>
            <span>{formatIDR(grandTotal)}</span>
          </div>
        </div>

        {quotation.notes && (
          <div className="rounded-lg border-l-4 border-lemon-500 bg-lemon-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-ink-500">Catatan</p>
            <p className="text-sm text-ink-800 mt-1 whitespace-pre-wrap">{quotation.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-ink-100">
          <SignatureBlock
            label="Disetujui Oleh"
            org={company.name}
            name={company.directorName}
            title={company.directorTitle}
            signatureUrl={adminSignatureUrl}
            signedAt={quotation.adminSignedAt}
          />
          <SignatureBlock
            label="Diajukan Oleh"
            org="Vendor"
            name={vendor.fullName}
            title={vendor.companyName || 'Vendor Independen'}
            signatureUrl={vendorSignatureUrl}
            signedAt={quotation.vendorSignedAt}
          />
        </div>
      </div>
    </article>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-end gap-2">
      <span className="text-ink-500">{label}</span>
      <span className="text-ink-800">: {value}</span>
    </div>
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
      <div className="h-20 flex items-center justify-center my-2">
        {signatureUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={signatureUrl} alt={`TTD ${name}`} className="max-h-20 max-w-[180px] object-contain" />
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
