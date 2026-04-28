import { z } from 'zod'

export const updateSPKSchema = z.object({
  workTitle: z.string().min(3, 'Judul pekerjaan minimal 3 karakter'),
  scopeItems: z.array(z.string().min(1)).min(1, 'Tambahkan minimal 1 lingkup pekerjaan'),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  warranty: z.string().optional(),
}).refine((d) => d.periodEnd >= d.periodStart, {
  message: 'Tanggal akhir harus setelah tanggal mulai',
  path: ['periodEnd'],
})

export type UpdateSPKInput = z.infer<typeof updateSPKSchema>

export const adminSignSPKSchema = z.object({
  signatureFileKey: z.string().optional(),
})

export const vendorSignSPKSchema = z.object({
  signatureFileKey: z.string().min(1, 'Tanda tangan wajib'),
})
