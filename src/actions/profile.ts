'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireVendor } from '@/lib/permissions'
import { vendorProfileSchema } from '@/schemas/vendor'
import type { ActionResult } from '@/types'

export async function updateVendorProfile(input: unknown): Promise<ActionResult<{ vendorStatus: string }>> {
  const session = await requireVendor()
  const parsed = vendorProfileSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } })
  if (!vendor) return { ok: false, error: 'Vendor tidak ditemukan' }

  const isFirstSubmission = vendor.status === 'PENDING_PROFILE'

  // After NIK is captured (first submit), it becomes immutable
  const nikLocked = !!vendor.nik

  const data: Record<string, unknown> = {
    fullName: parsed.data.fullName,
    address: parsed.data.address,
    phone: parsed.data.phone,
    companyName: parsed.data.companyName || null,
    bankName: parsed.data.bankName,
    bankAccountNo: parsed.data.bankAccountNo,
    bankAccountHolder: parsed.data.bankAccountHolder,
    npwp: parsed.data.npwp || null,
    ktpFileKey: parsed.data.ktpFileKey,
  }
  if (!nikLocked) data.nik = parsed.data.nik

  if (isFirstSubmission) {
    data.profileCompletedAt = new Date()
    data.status = 'PENDING_NDA_SIGN'
  }

  const updated = await prisma.vendor.update({
    where: { id: vendor.id },
    data,
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: isFirstSubmission ? 'vendor.profile_complete' : 'vendor.profile_update',
      entityType: 'Vendor',
      entityId: vendor.id,
    },
  })

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  if (isFirstSubmission) revalidatePath('/admin/vendors')

  return { ok: true, data: { vendorStatus: updated.status } }
}
