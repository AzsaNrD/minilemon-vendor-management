import { z } from 'zod'

export const quotationItemSchema = z.object({
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  price: z.number().nonnegative(),
  qty: z.number().int().min(1),
})

export type QuotationItemInput = z.infer<typeof quotationItemSchema>

export const submitQuotationSchema = z.object({
  items: z.array(quotationItemSchema).min(1, 'Tambahkan minimal 1 item'),
  ppnEnabled: z.boolean(),
  ppnPercent: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).optional(),
  notes: z.string().optional(),
  validityUntil: z.coerce
    .date()
    .refine((d) => d.getTime() >= Date.now() - 1000 * 60 * 60 * 24, 'Tanggal validitas tidak boleh di masa lalu'),
  parentQuotationId: z.string().optional(),
})

export type SubmitQuotationInput = z.infer<typeof submitQuotationSchema>

export const requestRevisionSchema = z.object({
  note: z.string().min(5, 'Tulis catatan revisi (minimal 5 karakter)'),
})

export const signQuotationSchema = z.object({
  signatureFileKey: z.string().optional(),
})

export const vendorSignQuotationSchema = z.object({
  signatureFileKey: z.string().min(1, 'Tanda tangan wajib'),
})

export function calculateQuotationTotals(input: {
  items: QuotationItemInput[]
  ppnEnabled: boolean
  ppnPercent?: number
  discount?: number
}) {
  const subtotal = input.items.reduce((sum, it) => sum + it.price * it.qty, 0)
  const discount = input.discount || 0
  const afterDiscount = Math.max(0, subtotal - discount)
  const ppn = input.ppnEnabled ? Math.round((afterDiscount * (input.ppnPercent ?? 11)) / 100) : 0
  const grandTotal = afterDiscount + ppn
  return { subtotal, discount, ppn, grandTotal }
}
