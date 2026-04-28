import { prisma } from './prisma'
import { getNextDocNumber } from './numbering'
import type { Vendor, NDA, Prisma } from '@prisma/client'
import type { VendorSnapshot } from '@/schemas/nda'

export function buildVendorSnapshot(vendor: Vendor): VendorSnapshot {
  return {
    fullName: vendor.fullName,
    nik: vendor.nik || '',
    address: vendor.address || '',
    phone: vendor.phone || '',
    companyName: vendor.companyName,
    npwp: vendor.npwp,
  }
}

export async function getCompanyInfo() {
  const settings = await prisma.companySettings.findUnique({ where: { id: 'singleton' } })
  if (!settings) {
    throw new Error('Company settings not initialized. Run prisma db seed.')
  }
  return settings
}

/**
 * Creates an NDA record for the vendor inside an existing transaction.
 * Idempotent: if vendor already has a non-superseded NDA, returns it.
 */
export async function ensureNDAForVendor(tx: Prisma.TransactionClient, vendor: Vendor): Promise<NDA> {
  const existing = await tx.nDA.findFirst({
    where: { vendorId: vendor.id, status: { not: 'SUPERSEDED' } },
    orderBy: { createdAt: 'desc' },
  })
  if (existing) return existing

  const docNumber = await getNextDocNumber('NDA')
  return tx.nDA.create({
    data: {
      docNumber,
      vendorId: vendor.id,
      vendorSnapshot: buildVendorSnapshot(vendor) as any,
      effectiveDate: new Date(),
      status: 'PENDING_VENDOR_SIGN',
    },
  })
}
