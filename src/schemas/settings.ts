import { z } from 'zod'

export const updateCompanySchema = z.object({
  name: z.string().min(3),
  address: z.string().min(10),
  phone: z.string().min(5),
  email: z.string().email(),
  directorName: z.string().min(3),
  directorTitle: z.string().min(3),
})

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
