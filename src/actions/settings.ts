'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { updateCompanySchema } from '@/schemas/settings'
import type { ActionResult } from '@/types'

const setMasterSignatureSchema = z.object({
  signatureFileKey: z.string().min(1, 'File signature wajib'),
})

export async function setMasterSignature(input: unknown): Promise<ActionResult<null>> {
  const session = await requireAdmin()
  const parsed = setMasterSignatureSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  await prisma.companySettings.update({
    where: { id: 'singleton' },
    data: { adminMasterSignatureKey: parsed.data.signatureFileKey },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'settings.master_signature',
      entityType: 'CompanySettings',
      entityId: 'singleton',
    },
  })

  revalidatePath('/admin/settings/signature')
  return { ok: true, data: null }
}

export async function updateCompanySettings(input: unknown): Promise<ActionResult<null>> {
  const session = await requireAdmin()
  const parsed = updateCompanySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  await prisma.companySettings.update({
    where: { id: 'singleton' },
    data: parsed.data,
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'settings.company_update',
      entityType: 'CompanySettings',
      entityId: 'singleton',
    },
  })

  revalidatePath('/admin/settings/company')
  return { ok: true, data: null }
}
