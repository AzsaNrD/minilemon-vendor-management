'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireVendor } from '@/lib/permissions'
import { sendEmail } from '@/lib/email'
import { createNotification, notifyAdmins } from '@/lib/notifications'
import { putS3Object } from '@/lib/s3'
import { renderPDF, fileKeyToDataUrl } from '@/lib/pdf'
import { SPKDocument, SPK_PDF_CSS } from '@/pdf-templates/SPKDocument'
import { getCompanyInfo } from '@/lib/nda'
import { updateSPKSchema, adminSignSPKSchema, vendorSignSPKSchema } from '@/schemas/spk'
import type { ActionResult } from '@/types'

export async function updateSPK(spkId: string, input: unknown): Promise<ActionResult<null>> {
  const session = await requireAdmin()
  const parsed = updateSPKSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const spk = await prisma.sPK.findUnique({ where: { id: spkId } })
  if (!spk) return { ok: false, error: 'SPK tidak ditemukan' }
  if (spk.status === 'SIGNED') {
    return { ok: false, error: 'SPK sudah final, tidak bisa diedit' }
  }

  await prisma.sPK.update({
    where: { id: spkId },
    data: {
      workTitle: parsed.data.workTitle,
      scopeItems: parsed.data.scopeItems as any,
      periodStart: parsed.data.periodStart,
      periodEnd: parsed.data.periodEnd,
      warranty: parsed.data.warranty || null,
    },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'spk.update',
      entityType: 'SPK',
      entityId: spkId,
    },
  })

  revalidatePath(`/admin/projects/${spk.projectId}`)
  return { ok: true, data: null }
}

export async function adminSignSPK(spkId: string, input: unknown = {}): Promise<ActionResult<null>> {
  const session = await requireAdmin()
  const parsed = adminSignSPKSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Validasi gagal' }

  const spk = await prisma.sPK.findUnique({
    where: { id: spkId },
    include: { vendor: { include: { user: { select: { id: true, email: true } } } } },
  })
  if (!spk) return { ok: false, error: 'SPK tidak ditemukan' }
  if (spk.workTitle.length === 0 || (spk.scopeItems as unknown as string[]).length === 0) {
    return { ok: false, error: 'Lengkapi judul dan lingkup pekerjaan terlebih dahulu' }
  }
  if (spk.status !== 'DRAFT' && spk.status !== 'PENDING_ADMIN_SIGN') {
    return { ok: false, error: 'SPK tidak dalam status yang bisa di-TTD admin' }
  }

  const company = await getCompanyInfo()
  const signatureKey = parsed.data.signatureFileKey || company.adminMasterSignatureKey
  if (!signatureKey) {
    return { ok: false, error: 'Master signature belum di-upload. Buka Settings > Signature.' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.sPK.update({
      where: { id: spkId },
      data: {
        status: 'PENDING_VENDOR_SIGN',
        adminSignatureKey: signatureKey,
        adminSignedAt: new Date(),
        adminSignedBy: session.user.id,
      },
    })
    await tx.project.update({
      where: { id: spk.projectId },
      data: { status: 'SPK_PENDING_SIGN', lastUpdatedAt: new Date() },
    })
    await createNotification(tx, {
      userId: spk.vendor.user.id,
      type: 'ACTION',
      title: 'SPK siap untuk TTD',
      body: `SPK ${spk.docNumber} telah ditandatangani admin. Mohon TTD untuk memulai pengerjaan.`,
      link: `/projects/${spk.projectId}?tab=spk`,
    })
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'spk.admin_sign',
        entityType: 'SPK',
        entityId: spkId,
      },
    })
  })

  try {
    await sendEmail({
      to: spk.vendor.user.email,
      template: 'spk-ready-sign',
      data: {
        vendorName: spk.vendor.fullName,
        docNumber: spk.docNumber,
        projectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${spk.projectId}?tab=spk`,
      },
    })
  } catch (e) {
    console.error('[spk] admin sign email failed', e)
  }

  revalidatePath(`/admin/projects/${spk.projectId}`)
  revalidatePath(`/projects/${spk.projectId}`)
  return { ok: true, data: null }
}

export async function vendorSignSPK(spkId: string, input: unknown): Promise<ActionResult<null>> {
  const session = await requireVendor()
  const parsed = vendorSignSPKSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const spk = await prisma.sPK.findUnique({
    where: { id: spkId },
    include: { project: true, vendor: true },
  })
  if (!spk) return { ok: false, error: 'SPK tidak ditemukan' }
  if (spk.vendorId !== session.user.vendorId) return { ok: false, error: 'Bukan SPK Anda' }
  if (spk.status !== 'PENDING_VENDOR_SIGN') {
    return { ok: false, error: 'SPK tidak siap untuk TTD vendor' }
  }

  const company = await getCompanyInfo()
  const [vendorSig, adminSig] = await Promise.all([
    fileKeyToDataUrl(parsed.data.signatureFileKey),
    spk.adminSignatureKey ? fileKeyToDataUrl(spk.adminSignatureKey) : undefined,
  ])

  let pdfFileKey: string
  try {
    const pdfBuffer = await renderPDF(
      SPKDocument({
        spk: { ...spk, vendorSignedAt: new Date(), status: 'SIGNED' } as any,
        company,
        vendorSignatureDataUrl: vendorSig,
        adminSignatureDataUrl: adminSig,
      }),
      { inlineCss: SPK_PDF_CSS },
    )
    const year = new Date().getFullYear()
    pdfFileKey = `documents/spk/${year}/${spk.docNumber.replace(/\//g, '-')}.pdf`
    await putS3Object(pdfFileKey, pdfBuffer, 'application/pdf')
  } catch (e) {
    console.error('[spk] PDF generation failed', e)
    return { ok: false, error: 'Gagal membuat PDF SPK. Silakan coba lagi.' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.sPK.update({
      where: { id: spkId },
      data: {
        status: 'SIGNED',
        vendorSignatureKey: parsed.data.signatureFileKey,
        vendorSignedAt: new Date(),
        pdfFileKey,
      },
    })
    await tx.project.update({
      where: { id: spk.projectId },
      data: { status: 'IN_PROGRESS', lastUpdatedAt: new Date() },
    })
    await notifyAdmins(tx, {
      type: 'SUCCESS',
      title: 'SPK aktif',
      body: `${spk.vendor.fullName} telah TTD SPK ${spk.docNumber}. Project sekarang dalam progress.`,
      link: `/admin/projects/${spk.projectId}`,
    })
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'spk.vendor_sign',
        entityType: 'SPK',
        entityId: spkId,
      },
    })
  })

  try {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', isActive: true }, select: { email: true } })
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        template: 'spk-signed-active',
        data: {
          vendorName: spk.vendor.fullName,
          projectName: spk.project.name,
          docNumber: spk.docNumber,
          adminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/projects/${spk.projectId}`,
        },
      })
    }
  } catch (e) {
    console.error('[spk] vendor sign email failed', e)
  }

  revalidatePath(`/projects/${spk.projectId}`)
  revalidatePath(`/admin/projects/${spk.projectId}`)
  return { ok: true, data: null }
}
