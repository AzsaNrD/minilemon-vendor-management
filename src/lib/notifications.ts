import { prisma } from './prisma'
import type { Prisma, NotificationType } from '@prisma/client'

interface CreateNotificationInput {
  userId: string
  type?: NotificationType
  title: string
  body: string
  link?: string
}

export async function createNotification(
  tx: Prisma.TransactionClient | typeof prisma,
  input: CreateNotificationInput,
) {
  return tx.notification.create({
    data: {
      userId: input.userId,
      type: input.type ?? 'INFO',
      title: input.title,
      body: input.body,
      link: input.link,
    },
  })
}

export async function notifyAdmins(
  tx: Prisma.TransactionClient | typeof prisma,
  input: Omit<CreateNotificationInput, 'userId'>,
) {
  const admins = await tx.user.findMany({
    where: { role: 'ADMIN', isActive: true },
    select: { id: true },
  })
  if (admins.length === 0) return
  await tx.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type: input.type ?? 'INFO',
      title: input.title,
      body: input.body,
      link: input.link,
    })),
  })
}
