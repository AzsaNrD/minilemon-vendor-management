import { z } from 'zod'

export const inviteVendorSchema = z.object({
  fullName: z.string().min(3, 'Minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  message: z.string().optional(),
})

export type InviteVendorInput = z.infer<typeof inviteVendorSchema>

export const vendorProfileSchema = z.object({
  fullName: z.string().min(3),
  nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit'),
  address: z.string().min(10),
  phone: z.string().regex(/^(\+62|0)\d{8,13}$/, 'Format: +62... atau 08...'),
  companyName: z.string().optional(),
  bankName: z.string().min(1, 'Wajib diisi'),
  bankAccountNo: z.string().min(5),
  bankAccountHolder: z.string().min(3),
  npwp: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/, 'Format NPWP: 00.000.000.0-000.000')
    .optional()
    .or(z.literal('')),
  ktpFileKey: z.string().min(1, 'Upload KTP wajib'),
})

export type VendorProfileInput = z.infer<typeof vendorProfileSchema>
