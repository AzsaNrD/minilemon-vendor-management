import { prisma } from '@/lib/prisma'
import { getCompanyInfo } from '@/lib/nda'
import { getSignedDownloadUrl } from '@/lib/s3'
import { VENDOR_STATUS_LABEL } from '@/lib/constants'
import type { Prisma, VendorStatus } from '@prisma/client'

export interface ListVendorsFilter {
  status?: string
  q?: string
}

export async function listAdminVendors(filter: ListVendorsFilter) {
  const where: Prisma.VendorWhereInput = { deletedAt: null }
  if (filter.status && filter.status !== 'all' && filter.status in VENDOR_STATUS_LABEL) {
    where.status = filter.status as VendorStatus
  }
  if (filter.q) {
    where.OR = [
      { fullName: { contains: filter.q, mode: 'insensitive' } },
      { vendorCode: { contains: filter.q, mode: 'insensitive' } },
      { user: { email: { contains: filter.q, mode: 'insensitive' } } },
    ]
  }

  return prisma.vendor.findMany({
    where,
    include: {
      user: { select: { email: true } },
      _count: { select: { projects: true } },
    },
    orderBy: { invitedAt: 'desc' },
  })
}

export async function listActiveVendorsForSelect() {
  return prisma.vendor.findMany({
    where: { status: 'ACTIVE', deletedAt: null },
    select: { id: true, fullName: true, vendorCode: true, category: true },
    orderBy: { fullName: 'asc' },
  })
}

export async function getVendorDetail(id: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, lastLoginAt: true, createdAt: true, isActive: true } },
      _count: { select: { projects: true } },
      ndas: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })
  if (!vendor) return null

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      OR: [
        { entityType: 'Vendor', entityId: vendor.id },
        { entityType: 'NDA', entityId: { in: vendor.ndas.map((n) => n.id) } },
        { userId: vendor.user.id },
      ],
    },
    include: { user: { select: { fullName: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const nda = vendor.ndas[0] ?? null
  const company = nda ? await getCompanyInfo() : null
  const [vendorSigUrl, adminSigUrl] = nda
    ? await Promise.all([
        nda.vendorSignatureKey ? getSignedDownloadUrl(nda.vendorSignatureKey).catch(() => undefined) : undefined,
        nda.adminSignatureKey ? getSignedDownloadUrl(nda.adminSignatureKey).catch(() => undefined) : undefined,
      ])
    : [undefined, undefined]

  return { vendor, auditLogs, nda, company, vendorSigUrl, adminSigUrl }
}
