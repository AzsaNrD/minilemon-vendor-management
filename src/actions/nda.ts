'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireVendor } from '@/lib/permissions'
import { sendEmail } from '@/lib/email'
import { putS3Object } from '@/lib/s3'
import { renderPDF, fileKeyToDataUrl } from '@/lib/pdf'
import { NDADocument, NDA_PDF_CSS } from '@/pdf-templates/NDADocument'
import { getCompanyInfo } from '@/lib/nda'
import { vendorSignNDASchema, adminSignNDASchema, type VendorSnapshot } from '@/schemas/nda'
import type { ActionResult } from '@/types'

async function getRequestIp(): Promise<string | undefined> {
  try {
    const h = await headers()
    return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || undefined
  } catch {
    return undefined
  }
}

export async function vendorSignNDA(input: unknown): Promise<ActionResult<{ ndaId: string }>> {
  const session = await requireVendor()
  const parsed = vendorSignNDASchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  if (!session.user.vendorId) return { ok: false, error: 'Vendor profile belum siap' }

  const nda = await prisma.nDA.findFirst({
    where: { vendorId: session.user.vendorId, status: 'PENDING_VENDOR_SIGN' },
    orderBy: { createdAt: 'desc' },
  })
  if (!nda) return { ok: false, error: 'Tidak ada NDA yang menunggu tanda tangan Anda' }

  const ip = await getRequestIp()

  await prisma.$transaction([
    prisma.nDA.update({
      where: { id: nda.id },
      data: {
        status: 'PENDING_ADMIN_SIGN',
        vendorSignatureKey: parsed.data.signatureFileKey,
        vendorSignedAt: new Date(),
        vendorSignedIp: ip,
      },
    }),
    prisma.vendor.update({
      where: { id: session.user.vendorId },
      data: { status: 'PENDING_ADMIN_SIGN' },
    }),
    prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'nda.vendor_sign',
        entityType: 'NDA',
        entityId: nda.id,
        ipAddress: ip,
      },
    }),
  ])

  // Notify admins
  try {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', isActive: true }, select: { email: true } })
    const snapshot = nda.vendorSnapshot as unknown as VendorSnapshot
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        template: 'nda-vendor-signed',
        data: {
          vendorName: snapshot.fullName,
          docNumber: nda.docNumber,
          adminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/vendors/${session.user.vendorId}?tab=nda`,
        },
      })
    }
  } catch (e) {
    console.error('[nda] vendor signed email failed', e)
  }

  revalidatePath('/nda')
  revalidatePath('/dashboard')
  revalidatePath(`/admin/vendors/${session.user.vendorId}`)

  return { ok: true, data: { ndaId: nda.id } }
}

export async function adminSignNDA(
  vendorId: string,
  input: unknown = {},
): Promise<ActionResult<{ ndaId: string }>> {
  const session = await requireAdmin()
  const parsed = adminSignNDASchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validasi gagal', fieldErrors: parsed.error.flatten().fieldErrors as any }
  }

  const nda = await prisma.nDA.findFirst({
    where: { vendorId, status: 'PENDING_ADMIN_SIGN' },
    orderBy: { createdAt: 'desc' },
    include: { vendor: { include: { user: { select: { email: true } } } } },
  })
  if (!nda) return { ok: false, error: 'NDA tidak ditemukan atau belum siap untuk ditandatangani admin' }

  const company = await getCompanyInfo()
  const signatureKey = parsed.data.signatureFileKey || company.adminMasterSignatureKey
  if (!signatureKey) {
    return { ok: false, error: 'Master signature belum di-upload. Buka Settings > Signature.' }
  }

  const ip = await getRequestIp()

  // Generate PDF with both signatures embedded
  const [vendorSigDataUrl, adminSigDataUrl] = await Promise.all([
    nda.vendorSignatureKey ? fileKeyToDataUrl(nda.vendorSignatureKey) : undefined,
    fileKeyToDataUrl(signatureKey),
  ])

  let pdfFileKey: string | undefined
  try {
    const pdfBuffer = await renderPDF(
      NDADocument({
        docNumber: nda.docNumber,
        effectiveDate: nda.effectiveDate,
        vendor: nda.vendorSnapshot as unknown as VendorSnapshot,
        company,
        vendorSignatureDataUrl: vendorSigDataUrl,
        adminSignatureDataUrl: adminSigDataUrl,
        vendorSignedAt: nda.vendorSignedAt,
        adminSignedAt: new Date(),
        status: 'SIGNED',
      }),
      { inlineCss: NDA_PDF_CSS },
    )
    const year = new Date().getFullYear()
    pdfFileKey = `documents/nda/${year}/${nda.docNumber.replace(/\//g, '-')}.pdf`
    await putS3Object(pdfFileKey, pdfBuffer, 'application/pdf')
  } catch (e) {
    console.error('[nda] PDF generation failed', e)
    return {
      ok: false,
      error: 'Gagal membuat PDF NDA. Periksa konfigurasi Puppeteer/Chromium dan coba lagi.',
    }
  }

  await prisma.$transaction([
    prisma.nDA.update({
      where: { id: nda.id },
      data: {
        status: 'SIGNED',
        adminSignatureKey: signatureKey,
        adminSignedAt: new Date(),
        adminSignedBy: session.user.id,
        adminSignedIp: ip,
        pdfFileKey,
      },
    }),
    prisma.vendor.update({
      where: { id: vendorId },
      data: { status: 'ACTIVE', activatedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'nda.admin_sign',
        entityType: 'NDA',
        entityId: nda.id,
        ipAddress: ip,
      },
    }),
  ])

  // Notify vendor
  try {
    await sendEmail({
      to: nda.vendor.user.email,
      template: 'nda-signed',
      data: {
        vendorName: nda.vendor.fullName,
        docNumber: nda.docNumber,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    })
  } catch (e) {
    console.error('[nda] admin signed email failed', e)
  }

  revalidatePath(`/admin/vendors/${vendorId}`)
  revalidatePath('/admin/vendors')
  revalidatePath('/admin/dashboard')
  revalidatePath('/nda')
  revalidatePath('/dashboard')

  return { ok: true, data: { ndaId: nda.id } }
}
