'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { sendEmail } from '@/lib/email'
import { generateTempPassword } from '@/lib/utils'
import { generateVendorCode } from '@/lib/numbering'
import { inviteVendorSchema } from '@/schemas/vendor'
import type { ActionResult } from '@/types'

export async function inviteVendor(input: unknown): Promise<ActionResult<{ vendorId: string }>> {
  const session = await requireAdmin()

  const parsed = inviteVendorSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return { ok: false, error: 'Email sudah terdaftar' }

  const vendorCode = await generateVendorCode(parsed.data.fullName)
  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 10)

  const vendor = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        role: 'VENDOR',
        fullName: parsed.data.fullName,
        mustChangePassword: true,
      },
    })
    return tx.vendor.create({
      data: {
        userId: user.id,
        vendorCode,
        fullName: parsed.data.fullName,
        status: 'PENDING_PROFILE',
      },
    })
  })

  try {
    await sendEmail({
      to: parsed.data.email,
      template: 'invite-vendor',
      data: {
        fullName: parsed.data.fullName,
        tempPassword,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      },
    })
  } catch (e) {
    console.error('[invite] email failed', e)
  }

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'vendor.invite',
      entityType: 'Vendor',
      entityId: vendor.id,
      metadata: { email: parsed.data.email, vendorCode },
    },
  })

  revalidatePath('/admin/vendors')
  revalidatePath('/admin/dashboard')

  return { ok: true, data: { vendorId: vendor.id } }
}

export async function disableVendor(vendorId: string, reason?: string): Promise<ActionResult<null>> {
  const session = await requireAdmin()

  await prisma.$transaction([
    prisma.vendor.update({ where: { id: vendorId }, data: { status: 'INACTIVE' } }),
    prisma.user.update({
      where: { id: (await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } })).userId },
      data: { isActive: false },
    }),
    prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'vendor.disable',
        entityType: 'Vendor',
        entityId: vendorId,
        metadata: { reason },
      },
    }),
  ])

  revalidatePath('/admin/vendors')
  revalidatePath(`/admin/vendors/${vendorId}`)
  return { ok: true, data: null }
}

export async function enableVendor(vendorId: string): Promise<ActionResult<null>> {
  const session = await requireAdmin()
  const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } })

  // Restore to ACTIVE only if previously fully onboarded; else PENDING_PROFILE
  const targetStatus = vendor.activatedAt ? 'ACTIVE' : 'PENDING_PROFILE'

  await prisma.$transaction([
    prisma.vendor.update({ where: { id: vendorId }, data: { status: targetStatus } }),
    prisma.user.update({ where: { id: vendor.userId }, data: { isActive: true } }),
    prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'vendor.enable',
        entityType: 'Vendor',
        entityId: vendorId,
      },
    }),
  ])

  revalidatePath('/admin/vendors')
  revalidatePath(`/admin/vendors/${vendorId}`)
  return { ok: true, data: null }
}

export async function resendInvite(vendorId: string): Promise<ActionResult<null>> {
  const session = await requireAdmin()
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { user: true },
  })
  if (!vendor) return { ok: false, error: 'Vendor tidak ditemukan' }
  if (vendor.status !== 'PENDING_PROFILE') {
    return { ok: false, error: 'Vendor sudah melengkapi biodata' }
  }

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 10)

  await prisma.user.update({
    where: { id: vendor.userId },
    data: { passwordHash, mustChangePassword: true },
  })

  try {
    await sendEmail({
      to: vendor.user.email,
      template: 'invite-vendor',
      data: {
        fullName: vendor.fullName,
        tempPassword,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      },
    })
  } catch (e) {
    console.error('[resend-invite] email failed', e)
  }

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'vendor.resend_invite',
      entityType: 'Vendor',
      entityId: vendorId,
    },
  })

  return { ok: true, data: null }
}
