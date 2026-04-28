'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'
import type { ActionResult } from '@/types'

export async function markNotificationRead(notificationId: string): Promise<ActionResult<null>> {
  const session = await requireAuth()

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.user.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  })

  revalidatePath('/admin/dashboard')
  revalidatePath('/dashboard')
  return { ok: true, data: null }
}

export async function markAllNotificationsRead(): Promise<ActionResult<null>> {
  const session = await requireAuth()

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  })

  revalidatePath('/admin/dashboard')
  revalidatePath('/dashboard')
  return { ok: true, data: null }
}
