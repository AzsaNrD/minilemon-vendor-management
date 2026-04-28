import type { Vendor, CompanySettings } from '@prisma/client'
import type { SerializedInvoice } from '@/lib/invoice'
import { formatDate, formatIDR } from '@/lib/utils'

interface Props {
  invoice: SerializedInvoice
  vendor: Vendor
  company: CompanySettings
  vendorSignatureUrl?: string
}

export function InvoicePreview({ invoice, vendor, company, vendorSignatureUrl }: Props) {
  return (
    <article className="bg-white rounded-xl border border-ink-100 shadow-soft overflow-hidden relative">
      {invoice.paidAt && (
        <div className="absolute top-12 right-8 rotate-[-15deg] border-4 border-leaf-500 text-leaf-500 px-6 py-1 text-xl font-bold tracking-widest opacity-70 z-10">
          LUNAS
        </div>
      )}
      <div className="bg-coral-500 text-white px-6 py-5 flex items-end justify-between">
        <div>
          <p className="font-display text-2xl font-bold tracking-widest">INVOICE</p>
          <p className="text-xs opacity-90 font-mono mt-0.5">{invoice.docNumber}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-bold">{company.name}</p>
          <p className="text-xs opacity-90">{company.address}</p>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Dari</p>
            <p className="font-bold text-ink-900 mt-1">
              {vendor.fullName}
              {vendor.companyName ? ` (${vendor.companyName})` : ''}
            </p>
            {vendor.address && <p className="text-sm text-ink-600">{vendor.address}</p>}
            {vendor.phone && <p className="text-sm text-ink-600">{vendor.phone}</p>}
          </div>
          <div className="text-right text-sm space-y-0.5">
            <Row label="Kepada" value={company.name} />
            <Row label="Tanggal" value={formatDate(invoice.invoiceDate)} />
            {invoice.paidAt && <Row label="Dibayar" value={formatDate(invoice.paidAt)} />}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-ink-100">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-white text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-4 py-2">Deskripsi</th>
                <th className="text-right font-medium px-4 py-2 w-48">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 text-ink-800">
                  Pembayaran atas penyelesaian project sesuai SPK terkait. Detail terlampir pada deliverable Drive
                  link.
                </td>
                <td className="px-4 py-3 text-right font-medium text-ink-900">{formatIDR(invoice.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-full max-w-xs">
          <div className="flex justify-between border-y-2 border-coral-500 px-3 py-2 font-display text-lg font-bold text-coral-600">
            <span>Total Tagihan</span>
            <span>{formatIDR(invoice.amount)}</span>
          </div>
        </div>

        {vendor.bankName && (
          <div className="rounded-lg bg-coral-50 border-l-4 border-coral-500 px-4 py-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-ink-500 mb-1">Pembayaran Ke</p>
            <p>
              <strong>{vendor.bankName}</strong> · {vendor.bankAccountNo} a/n {vendor.bankAccountHolder}
            </p>
          </div>
        )}

        {invoice.notes && (
          <div className="rounded-lg border-l-4 border-lemon-500 bg-lemon-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-ink-500">Catatan</p>
            <p className="text-sm text-ink-800 mt-1 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 pt-6 border-t border-ink-100">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-ink-500">Diterbitkan Oleh</p>
            <p className="font-bold text-sm">Vendor</p>
            <div className="h-20 flex items-center justify-center my-2">
              {vendorSignatureUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={vendorSignatureUrl}
                  alt={`TTD ${vendor.fullName}`}
                  className="max-h-20 max-w-[180px] object-contain"
                />
              ) : (
                <span className="text-ink-300 italic text-xs">[ Menunggu tanda tangan ]</span>
              )}
            </div>
            <p className="font-bold border-t border-ink-900 pt-1 text-sm">{vendor.fullName}</p>
            {invoice.vendorSignedAt && (
              <p className="text-[10px] text-ink-400 italic mt-1">
                Ditandatangani: {formatDate(invoice.vendorSignedAt)}
              </p>
            )}
          </div>
          <div />
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
