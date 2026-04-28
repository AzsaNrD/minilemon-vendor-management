import { z } from 'zod'

export const vendorSignNDASchema = z.object({
  signatureFileKey: z.string().min(1, 'Tanda tangan wajib diunggah'),
  agreed: z.literal(true).or(z.literal('true')),
})

export type VendorSignNDAInput = z.infer<typeof vendorSignNDASchema>

export const adminSignNDASchema = z.object({
  signatureFileKey: z.string().optional(),
})

export type AdminSignNDAInput = z.infer<typeof adminSignNDASchema>

export interface VendorSnapshot {
  fullName: string
  nik: string
  address: string
  phone: string
  companyName?: string | null
  npwp?: string | null
}
