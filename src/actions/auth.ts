'use server'

import { z } from 'zod'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { auth, signOut } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { generateRandomToken } from '@/lib/utils'
import type { ActionResult } from '@/types'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, 'Minimal 8 karakter')
    .regex(/[A-Za-z]/, 'Harus mengandung huruf')
    .regex(/[0-9]/, 'Harus mengandung angka'),
})

export async function changePassword(input: unknown): Promise<ActionResult<null>> {
  const session = await auth()
  if (!session?.user) return { ok: false, error: 'Tidak terautentikasi' }

  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return { ok: false, error: 'User tidak ditemukan' }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
  if (!valid) return { ok: false, error: 'Password saat ini salah' }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false },
  })

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'auth.change_password',
      entityType: 'User',
      entityId: user.id,
    },
  })

  return { ok: true, data: null }
}

const forgotPasswordSchema = z.object({ email: z.string().email() })

export async function forgotPassword(input: unknown): Promise<ActionResult<null>> {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Email tidak valid' }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })

  if (user && user.isActive) {
    const token = generateRandomToken()
    const tokenHash = await bcrypt.hash(token, 10)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordReset.create({
      data: { userId: user.id, tokenHash, expiresAt },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`

    await sendEmail({
      to: user.email,
      template: 'password-reset',
      data: { fullName: user.fullName, resetUrl },
    }).catch((err) => {
      console.error('Failed to send reset email', err)
    })
  }

  return { ok: true, data: null }
}

const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(8, 'Minimal 8 karakter')
    .regex(/[A-Za-z]/, 'Harus mengandung huruf')
    .regex(/[0-9]/, 'Harus mengandung angka'),
})

export async function resetPassword(input: unknown): Promise<ActionResult<null>> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (!user) return { ok: false, error: 'Token tidak valid atau kedaluwarsa' }

  const resets = await prisma.passwordReset.findMany({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  let matched: (typeof resets)[number] | undefined
  for (const r of resets) {
    if (await bcrypt.compare(parsed.data.token, r.tokenHash)) {
      matched = r
      break
    }
  }
  if (!matched) return { ok: false, error: 'Token tidak valid atau kedaluwarsa' }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10)
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash, mustChangePassword: false } }),
    prisma.passwordReset.update({ where: { id: matched.id }, data: { usedAt: new Date() } }),
    prisma.auditLog.create({
      data: { userId: user.id, action: 'auth.reset_password', entityType: 'User', entityId: user.id },
    }),
  ])

  return { ok: true, data: null }
}

export async function logout() {
  await signOut({ redirectTo: '/login' })
}
