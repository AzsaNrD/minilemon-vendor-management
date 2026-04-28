'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireVendor } from '@/lib/permissions'
import { sendEmail } from '@/lib/email'
import { createNotification, notifyAdmins } from '@/lib/notifications'
import { putS3Object } from '@/lib/s3'
import { renderPDF, fileKeyToDataUrl } from '@/lib/pdf'
import { InvoiceDocument, INVOICE_PDF_CSS } from '@/pdf-templates/InvoiceDocument'
import { getCompanyInfo } from '@/lib/nda'
import { getNextDocNumber } from '@/lib/numbering'
import { submitInvoiceSchema, markInvoicePaidSchema } from '@/schemas/invoice'
import { formatIDR } from '@/lib/utils'
import type { ActionResult } from '@/types'

export async function submitInvoice(
  projectId: string,
  input: unknown,
): Promise<ActionResult<{ invoiceId: string }>> {
  const session = await requireVendor()
  const parsed = submitInvoiceSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      vendor: true,
      spk: { include: { project: { include: { quotations: { where: { status: 'SIGNED' }, take: 1 } } } } },
    },
  })
  if (!project) return { ok: false, error: 'Project tidak ditemukan' }
  if (project.vendorId !== session.user.vendorId) return { ok: false, error: 'Bukan project Anda' }
  if (project.status !== 'IN_PROGRESS') {
    return { ok: false, error: 'Project belum siap untuk di-invoice' }
  }
  if (!project.spk || project.spk.status !== 'SIGNED') {
    return { ok: false, error: 'SPK belum aktif' }
  }
  const existing = await prisma.invoice.findUnique({ where: { projectId } })
  if (existing) return { ok: false, error: 'Invoice sudah pernah disubmit untuk project ini' }

  const signedQuotation = project.spk.project.quotations[0]
  if (!signedQuotation) return { ok: false, error: 'Quotation tidak ditemukan' }

  const docNumber = await getNextDocNumber('INV', project.vendor.vendorCode)

  const invoice = await prisma.$transaction(async (tx) => {
    const created = await tx.invoice.create({
      data: {
        docNumber,
        projectId,
        spkId: project.spk!.id,
        vendorId: project.vendorId,
        invoiceDate: new Date(),
        amount: signedQuotation.grandTotal,
        deliverableDriveLink: parsed.data.deliverableDriveLink,
        notes: parsed.data.notes,
        status: 'SUBMITTED',
        vendorSignatureKey: parsed.data.signatureFileKey,
        vendorSignedAt: new Date(),
      },
    })
    await tx.project.update({
      where: { id: projectId },
      data: { status: 'INVOICE_SUBMITTED', lastUpdatedAt: new Date() },
    })
    await notifyAdmins(tx, {
      type: 'ACTION',
      title: 'Invoice baru',
      body: `${project.vendor.fullName} mengirim invoice ${docNumber}.`,
      link: `/admin/projects/${projectId}?tab=invoice`,
    })
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'invoice.submit',
        entityType: 'Invoice',
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
        template: 'invoice-submitted',
        data: {
          vendorName: project.vendor.fullName,
          projectName: project.name,
          docNumber: invoice.docNumber,
          amount: formatIDR(Number(invoice.amount)),
          driveLink: parsed.data.deliverableDriveLink,
          adminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/projects/${projectId}?tab=invoice`,
        },
      })
    }
  } catch (e) {
    console.error('[invoice] submit email failed', e)
  }

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}`)
  return { ok: true, data: { invoiceId: invoice.id } }
}

export async function approveInvoice(invoiceId: string): Promise<ActionResult<null>> {
  const session = await requireAdmin()
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      project: true,
      vendor: { include: { user: { select: { id: true, email: true } } } },
    },
  })
  if (!invoice) return { ok: false, error: 'Invoice tidak ditemukan' }
  if (invoice.status !== 'SUBMITTED') {
    return { ok: false, error: 'Invoice tidak dalam status yang bisa di-approve' }
  }

  const company = await getCompanyInfo()
  const vendorSig = invoice.vendorSignatureKey ? await fileKeyToDataUrl(invoice.vendorSignatureKey) : undefined

  let pdfFileKey: string
  try {
    const pdfBuffer = await renderPDF(
      InvoiceDocument({
        invoice: { ...invoice, status: 'APPROVED', approvedAt: new Date() } as any,
        vendor: invoice.vendor,
        company,
        vendorSignatureDataUrl: vendorSig,
      }),
      { inlineCss: INVOICE_PDF_CSS },
    )
    const year = new Date().getFullYear()
    pdfFileKey = `documents/invoice/${year}/${invoice.docNumber.replace(/\//g, '-')}.pdf`
    await putS3Object(pdfFileKey, pdfBuffer, 'application/pdf')
  } catch (e) {
    console.error('[invoice] PDF generation failed', e)
    return { ok: false, error: 'Gagal membuat PDF invoice' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: session.user.id,
        pdfFileKey,
      },
    })
    await tx.project.update({
      where: { id: invoice.projectId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        lastUpdatedAt: new Date(),
      },
    })
    await createNotification(tx, {
      userId: invoice.vendor.user.id,
      type: 'SUCCESS',
      title: 'Invoice disetujui',
      body: `Invoice ${invoice.docNumber} telah disetujui. Project selesai!`,
      link: `/projects/${invoice.projectId}?tab=invoice`,
    })
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'invoice.approve',
        entityType: 'Invoice',
        entityId: invoiceId,
      },
    })
  })

  try {
    await sendEmail({
      to: invoice.vendor.user.email,
      template: 'invoice-approved',
      data: {
        vendorName: invoice.vendor.fullName,
        docNumber: invoice.docNumber,
        amount: formatIDR(Number(invoice.amount)),
        projectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${invoice.projectId}`,
      },
    })
  } catch (e) {
    console.error('[invoice] approve email failed', e)
  }

  revalidatePath(`/admin/projects/${invoice.projectId}`)
  revalidatePath(`/projects/${invoice.projectId}`)
  return { ok: true, data: null }
}

export async function markInvoicePaid(invoiceId: string, input: unknown): Promise<ActionResult<null>> {
  const session = await requireAdmin()
  const parsed = markInvoicePaidSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
  if (!invoice) return { ok: false, error: 'Invoice tidak ditemukan' }
  if (invoice.status !== 'APPROVED') {
    return { ok: false, error: 'Invoice belum di-approve' }
  }

  await prisma.$transaction([
    prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAt: parsed.data.paidAt,
        paymentRef: parsed.data.paymentRef,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'invoice.mark_paid',
        entityType: 'Invoice',
        entityId: invoiceId,
        metadata: { paidAt: parsed.data.paidAt, paymentRef: parsed.data.paymentRef },
      },
    }),
  ])

  revalidatePath(`/admin/projects/${invoice.projectId}`)
  return { ok: true, data: null }
}
