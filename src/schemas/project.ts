import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Minimal 3 karakter'),
  vendorId: z.string().min(1, 'Vendor wajib dipilih'),
  brief: z.string().min(20, 'Brief minimal 20 karakter'),
  deadlineEstimate: z
    .string()
    .optional()
    .transform((s) => (s ? new Date(s) : undefined)),
  assetDriveLink: z
    .string()
    .url('Harus berupa URL valid')
    .optional()
    .or(z.literal('')),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectSchema = createProjectSchema.partial().extend({
  vendorId: z.string().optional(),
})

export const cancelProjectSchema = z.object({
  reason: z.string().min(5, 'Alasan wajib diisi (minimal 5 karakter)'),
})

export const sendChatSchema = z
  .object({
    content: z.string().optional(),
    driveLinkUrl: z.string().url().optional().or(z.literal('')),
    driveLinkTitle: z.string().optional(),
  })
  .refine((v) => (v.content && v.content.trim().length > 0) || (v.driveLinkUrl && v.driveLinkUrl.length > 0), {
    message: 'Isi pesan atau tambahkan tautan',
  })
