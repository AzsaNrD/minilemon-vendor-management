'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { sendEmail } from '@/lib/email'
import { createNotification } from '@/lib/notifications'
import { createProjectSchema, updateProjectSchema, cancelProjectSchema } from '@/schemas/project'
import type { ActionResult } from '@/types'

export async function createProject(input: unknown): Promise<ActionResult<{ projectId: string }>> {
  const session = await requireAdmin()
  const parsed = createProjectSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: parsed.data.vendorId },
    include: { user: { select: { id: true, email: true, fullName: true } } },
  })
  if (!vendor) return { ok: false, error: 'Vendor tidak ditemukan' }
  if (vendor.status !== 'ACTIVE') {
    return { ok: false, error: 'Vendor belum aktif. NDA harus selesai ditandatangani dahulu.' }
  }

  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        name: parsed.data.name,
        vendorId: parsed.data.vendorId,
        brief: parsed.data.brief,
        deadlineEstimate: parsed.data.deadlineEstimate,
        assetDriveLink: parsed.data.assetDriveLink || null,
        status: 'QUOTATION_PENDING',
      },
    })

    await createNotification(tx, {
      userId: vendor.user.id,
      type: 'ACTION',
      title: 'Project baru ditugaskan',
      body: `Anda mendapat project baru: "${created.name}". Silakan submit quotation.`,
      link: `/projects/${created.id}`,
    })

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'project.create',
        entityType: 'Project',
        entityId: created.id,
        metadata: { vendorId: vendor.id, vendorName: vendor.fullName },
      },
    })

    return created
  })

  try {
    await sendEmail({
      to: vendor.user.email,
      template: 'project-assigned',
      data: {
        vendorName: vendor.fullName,
        projectName: project.name,
        brief: project.brief,
        projectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${project.id}`,
      },
    })
  } catch (e) {
    console.error('[project] assign email failed', e)
  }

  revalidatePath('/admin/projects')
  revalidatePath('/admin/dashboard')

  return { ok: true, data: { projectId: project.id } }
}

export async function updateProject(projectId: string, input: unknown): Promise<ActionResult<null>> {
  const session = await requireAdmin()
  const parsed = updateProjectSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { ok: false, error: 'Project tidak ditemukan' }
  if (['COMPLETED', 'CANCELLED'].includes(project.status)) {
    return { ok: false, error: 'Project tidak bisa diedit di status ini' }
  }

  await prisma.$transaction([
    prisma.project.update({
      where: { id: projectId },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.brief && { brief: parsed.data.brief }),
        ...(parsed.data.deadlineEstimate !== undefined && { deadlineEstimate: parsed.data.deadlineEstimate }),
        ...(parsed.data.assetDriveLink !== undefined && {
          assetDriveLink: parsed.data.assetDriveLink || null,
        }),
        lastUpdatedAt: new Date(),
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'project.update',
        entityType: 'Project',
        entityId: projectId,
      },
    }),
  ])

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath('/admin/projects')
  return { ok: true, data: null }
}

export async function cancelProject(projectId: string, input: unknown): Promise<ActionResult<null>> {
  const session = await requireAdmin()
  const parsed = cancelProjectSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { vendor: { include: { user: { select: { id: true, email: true } } } } },
  })
  if (!project) return { ok: false, error: 'Project tidak ditemukan' }
  if (project.status === 'COMPLETED' || project.status === 'CANCELLED') {
    return { ok: false, error: 'Project sudah final, tidak bisa dibatalkan' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id: projectId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledReason: parsed.data.reason,
        lastUpdatedAt: new Date(),
      },
    })

    await createNotification(tx, {
      userId: project.vendor.user.id,
      type: 'WARNING',
      title: 'Project dibatalkan',
      body: `Project "${project.name}" telah dibatalkan oleh admin.`,
      link: `/projects/${projectId}`,
    })

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'project.cancel',
        entityType: 'Project',
        entityId: projectId,
        metadata: { reason: parsed.data.reason },
      },
    })
  })

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath('/admin/projects')
  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/projects')
  return { ok: true, data: null }
}
