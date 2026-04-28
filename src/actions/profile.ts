'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireVendor } from '@/lib/permissions'
import { vendorProfileSchema } from '@/schemas/vendor'
import { ensureNDAForVendor } from '@/lib/nda'
import { sendEmail } from '@/lib/email'
import type { ActionResult } from '@/types'

export async function updateVendorProfile(input: unknown): Promise<ActionResult<{ vendorStatus: string }>> {
  const session = await requireVendor()
  const parsed = vendorProfileSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { email: true } } },
  })
  if (!vendor) return { ok: false, error: 'Vendor tidak ditemukan' }

  const isFirstSubmission = vendor.status === 'PENDING_PROFILE'
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

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.vendor.update({
      where: { id: vendor.id },
      data,
    })

    // Auto-generate NDA on first profile submission
    if (isFirstSubmission) {
      await ensureNDAForVendor(tx, updated)
    }

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: isFirstSubmission ? 'vendor.profile_complete' : 'vendor.profile_update',
        entityType: 'Vendor',
        entityId: vendor.id,
      },
    })

    return updated
  })

  // Side-effects after successful transaction
  if (isFirstSubmission) {
    try {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN', isActive: true }, select: { email: true } })
      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          template: 'vendor-profile-completed',
          data: {
            vendorName: result.fullName,
            vendorEmail: vendor.user.email,
            adminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/vendors/${vendor.id}`,
          },
        })
      }
    } catch (e) {
      console.error('[profile] failed to email admins', e)
    }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  if (isFirstSubmission) {
    revalidatePath('/admin/vendors')
    revalidatePath(`/admin/vendors/${vendor.id}`)
  }

  return { ok: true, data: { vendorStatus: result.status } }
}
