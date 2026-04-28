'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireProjectAccess } from '@/lib/permissions'
import { sendChatSchema } from '@/schemas/project'
import type { ActionResult } from '@/types'

export async function sendChatMessage(
  projectId: string,
  input: unknown,
): Promise<ActionResult<{ messageId: string }>> {
  const session = await requireAuth()
  await requireProjectAccess(projectId)

  const parsed = sendChatSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message || 'Validasi gagal' }
  }

  const message = await prisma.chatMessage.create({
    data: {
      projectId,
      senderId: session.user.id,
      content: parsed.data.content?.trim() || null,
      driveLink:
        parsed.data.driveLinkUrl
          ? ({ url: parsed.data.driveLinkUrl, title: parsed.data.driveLinkTitle || parsed.data.driveLinkUrl } as any)
          : undefined,
    },
  })

  await prisma.project.update({
    where: { id: projectId },
    data: { lastUpdatedAt: new Date() },
  })

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}`)
  return { ok: true, data: { messageId: message.id } }
}
