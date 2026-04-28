'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireVendor } from '@/lib/permissions'
import { sendEmail } from '@/lib/email'
import { createNotification, notifyAdmins } from '@/lib/notifications'
import { putS3Object } from '@/lib/s3'
import { renderPDF, fileKeyToDataUrl } from '@/lib/pdf'
import { QuotationDocument, QUOTATION_PDF_CSS } from '@/pdf-templates/QuotationDocument'
import { getCompanyInfo } from '@/lib/nda'
import { createQuotation } from '@/lib/quotation'
import { formatIDR } from '@/lib/utils'
import {
  submitQuotationSchema,
  requestRevisionSchema,
  signQuotationSchema,
  vendorSignQuotationSchema,
} from '@/schemas/quotation'
import type { ActionResult } from '@/types'

export async function submitQuotation(
  projectId: string,
  input: unknown,
): Promise<ActionResult<{ quotationId: string }>> {
  const session = await requireVendor()
  const parsed = submitQuotationSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { vendor: true },
  })
  if (!project) return { ok: false, error: 'Project tidak ditemukan' }
  if (project.vendorId !== session.user.vendorId) return { ok: false, error: 'Bukan project Anda' }

  // Allow submission only when status is QUOTATION_PENDING, QUOTATION_NEGOTIATION,
  // or QUOTATION_SUBMITTED (re-submit before admin acted on the previous one)
  const allowedProjectStatuses = ['QUOTATION_PENDING', 'QUOTATION_SUBMITTED', 'QUOTATION_NEGOTIATION']
  if (!allowedProjectStatuses.includes(project.status)) {
    return { ok: false, error: 'Project tidak dalam tahap quotation' }
  }

  // For revision, must reference a parent that is REVISION_REQUESTED
  if (parsed.data.parentQuotationId) {
    const parent = await prisma.quotation.findUnique({ where: { id: parsed.data.parentQuotationId } })
    if (!parent || parent.projectId !== projectId) {
      return { ok: false, error: 'Quotation parent tidak valid' }
    }
  }

  const quotation = await prisma.$transaction(async (tx) => {
    const created = await createQuotation(tx, {
      projectId,
      vendorId: project.vendorId,
      items: parsed.data.items,
      ppnEnabled: parsed.data.ppnEnabled,
      ppnPercent: parsed.data.ppnPercent,
      discount: parsed.data.discount,
      notes: parsed.data.notes,
      validityUntil: parsed.data.validityUntil,
      parentQuotationId: parsed.data.parentQuotationId,
    })

    await tx.project.update({
      where: { id: projectId },
      data: {
        status: 'QUOTATION_SUBMITTED',
        lastUpdatedAt: new Date(),
      },
    })

    await notifyAdmins(tx, {
      type: 'ACTION',
      title: 'Quotation baru',
      body: `${project.vendor.fullName} mengirim quotation untuk "${project.name}".`,
      link: `/admin/projects/${projectId}?tab=quotation`,
    })

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: parsed.data.parentQuotationId ? 'quotation.revise' : 'quotation.submit',
        entityType: 'Quotation',
        entityId: created.id,
      },
    })

    return created
  })

  try {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', isActive: true }, select: { email: true } })
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        template: 'quotation-submitted',
        data: {
          vendorName: project.vendor.fullName,
          projectName: project.name,
          docNumber: quotation.docNumber,
          grandTotal: formatIDR(Number(quotation.grandTotal)),
          adminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/projects/${projectId}?tab=quotation`,
        },
      })
    }
  } catch (e) {
    console.error('[quotation] submit email failed', e)
  }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath('/admin/projects')

  return { ok: true, data: { quotationId: quotation.id } }
}

export async function requestQuotationRevision(
  quotationId: string,
  input: unknown,
): Promise<ActionResult<null>> {
  const session = await requireAdmin()
  const parsed = requestRevisionSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { project: true, vendor: { include: { user: { select: { id: true, email: true } } } } },
  })
  if (!quotation) return { ok: false, error: 'Quotation tidak ditemukan' }
  if (quotation.status !== 'SUBMITTED' && quotation.status !== 'NEGOTIATION') {
    return { ok: false, error: 'Quotation tidak dalam status yang bisa diminta revisi' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.quotation.update({
      where: { id: quotationId },
      data: {
        status: 'REVISION_REQUESTED',
        revisionRequestNote: parsed.data.note,
      },
    })
    await tx.project.update({
      where: { id: quotation.projectId },
      data: { status: 'QUOTATION_NEGOTIATION', lastUpdatedAt: new Date() },
    })
    await createNotification(tx, {
      userId: quotation.vendor.user.id,
      type: 'ACTION',
      title: 'Revisi quotation diminta',
      body: `Admin meminta revisi untuk quotation ${quotation.docNumber}.`,
      link: `/projects/${quotation.projectId}?tab=quotation`,
    })
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'quotation.revision_requested',
        entityType: 'Quotation',
        entityId: quotationId,
        metadata: { note: parsed.data.note },
      },
    })
  })

  try {
    await sendEmail({
      to: quotation.vendor.user.email,
      template: 'quotation-revision-requested',
      data: {
        vendorName: quotation.vendor.fullName,
        projectName: quotation.project.name,
        docNumber: quotation.docNumber,
        note: parsed.data.note,
        projectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${quotation.projectId}?tab=quotation`,
      },
    })
  } catch (e) {
    console.error('[quotation] revision email failed', e)
  }

  revalidatePath(`/projects/${quotation.projectId}`)
  revalidatePath(`/admin/projects/${quotation.projectId}`)
  return { ok: true, data: null }
}

export async function adminSignQuotation(quotationId: string, input: unknown = {}): Promise<ActionResult<null>> {
  const session = await requireAdmin()
  const parsed = signQuotationSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal' }
  }

  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { project: true, vendor: { include: { user: { select: { email: true, id: true } } } } },
  })
  if (!quotation) return { ok: false, error: 'Quotation tidak ditemukan' }
  if (quotation.status !== 'SUBMITTED' && quotation.status !== 'NEGOTIATION') {
    return { ok: false, error: 'Quotation tidak dalam status yang bisa di-approve' }
  }

  const company = await getCompanyInfo()
  const signatureKey = parsed.data.signatureFileKey || company.adminMasterSignatureKey
  if (!signatureKey) {
    return { ok: false, error: 'Master signature belum di-upload. Buka Settings > Signature.' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.quotation.update({
      where: { id: quotationId },
      data: {
        status: 'PENDING_VENDOR_SIGN',
        adminSignatureKey: signatureKey,
        adminSignedAt: new Date(),
        adminSignedBy: session.user.id,
      },
    })
    await tx.project.update({
      where: { id: quotation.projectId },
      data: { lastUpdatedAt: new Date() },
    })
    await createNotification(tx, {
      userId: quotation.vendor.user.id,
      type: 'ACTION',
      title: 'Quotation disetujui',
      body: `Quotation ${quotation.docNumber} sudah disetujui admin. Mohon TTD final.`,
      link: `/projects/${quotation.projectId}?tab=quotation`,
    })
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'quotation.admin_sign',
        entityType: 'Quotation',
        entityId: quotationId,
      },
    })
  })

  try {
    await sendEmail({
      to: quotation.vendor.user.email,
      template: 'quotation-admin-signed',
      data: {
        vendorName: quotation.vendor.fullName,
        docNumber: quotation.docNumber,
        projectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${quotation.projectId}?tab=quotation`,
      },
    })
  } catch (e) {
    console.error('[quotation] admin sign email failed', e)
  }

  revalidatePath(`/projects/${quotation.projectId}`)
  revalidatePath(`/admin/projects/${quotation.projectId}`)
  return { ok: true, data: null }
}

export async function vendorSignQuotation(quotationId: string, input: unknown): Promise<ActionResult<null>> {
  const session = await requireVendor()
  const parsed = vendorSignQuotationSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { project: true, vendor: true },
  })
  if (!quotation) return { ok: false, error: 'Quotation tidak ditemukan' }
  if (quotation.vendorId !== session.user.vendorId) return { ok: false, error: 'Bukan quotation Anda' }
  if (quotation.status !== 'PENDING_VENDOR_SIGN') {
    return { ok: false, error: 'Quotation tidak siap untuk TTD final' }
  }

  // Render & cache the final PDF
  const company = await getCompanyInfo()
  const [vendorSig, adminSig] = await Promise.all([
    fileKeyToDataUrl(parsed.data.signatureFileKey),
    quotation.adminSignatureKey ? fileKeyToDataUrl(quotation.adminSignatureKey) : undefined,
  ])

  let pdfFileKey: string | undefined
  try {
    const pdfBuffer = await renderPDF(
      QuotationDocument({
        quotation: { ...quotation, vendorSignedAt: new Date() } as any,
        vendor: quotation.vendor,
        company,
        vendorSignatureDataUrl: vendorSig,
        adminSignatureDataUrl: adminSig,
      }),
      { inlineCss: QUOTATION_PDF_CSS },
    )
    const year = new Date().getFullYear()
    pdfFileKey = `documents/quotation/${year}/${quotation.docNumber.replace(/\//g, '-')}.pdf`
    await putS3Object(pdfFileKey, pdfBuffer, 'application/pdf')
  } catch (e) {
    console.error('[quotation] PDF generation failed', e)
    return { ok: false, error: 'Gagal membuat PDF quotation. Silakan coba lagi.' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.quotation.update({
      where: { id: quotationId },
      data: {
        status: 'SIGNED',
        vendorSignatureKey: parsed.data.signatureFileKey,
        vendorSignedAt: new Date(),
        pdfFileKey,
      },
    })
    await tx.project.update({
      where: { id: quotation.projectId },
      data: {
        status: 'QUOTATION_SIGNED',
        lastUpdatedAt: new Date(),
      },
    })
    await notifyAdmins(tx, {
      type: 'ACTION',
      title: 'Quotation final ditandatangani',
      body: `${quotation.vendor.fullName} telah TTD final quotation ${quotation.docNumber}. Lengkapi SPK draft.`,
      link: `/admin/projects/${quotation.projectId}?tab=spk`,
    })
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'quotation.vendor_sign',
        entityType: 'Quotation',
        entityId: quotationId,
      },
    })
  })

  try {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', isActive: true }, select: { email: true } })
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        template: 'quotation-signed',
        data: {
          vendorName: quotation.vendor.fullName,
          projectName: quotation.project.name,
          docNumber: quotation.docNumber,
          adminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/projects/${quotation.projectId}?tab=spk`,
        },
      })
    }
  } catch (e) {
    console.error('[quotation] vendor sign email failed', e)
  }

  revalidatePath(`/projects/${quotation.projectId}`)
  revalidatePath(`/admin/projects/${quotation.projectId}`)
  return { ok: true, data: null }
}
