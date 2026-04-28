import type { Prisma, SPK, Vendor, Quotation } from '@prisma/client'
import { getNextDocNumber } from './numbering'
import { buildVendorSnapshot } from './nda'

interface CreateSPKDraftInput {
  projectId: string
  vendorId: string
  vendor: Vendor
  quotation: Quotation
}

export async function ensureSPKDraft(tx: Prisma.TransactionClient, input: CreateSPKDraftInput): Promise<SPK> {
  const existing = await tx.sPK.findUnique({ where: { projectId: input.projectId } })
  if (existing) return existing

  const docNumber = await getNextDocNumber('SPK')
  const periodStart = new Date()
  const periodEnd = new Date()
  periodEnd.setDate(periodEnd.getDate() + 14)

  return tx.sPK.create({
    data: {
      docNumber,
      projectId: input.projectId,
      quotationId: input.quotation.id,
      vendorId: input.vendorId,
      vendorSnapshot: buildVendorSnapshot(input.vendor) as any,
      workTitle: '',
      scopeItems: [] as any,
      periodStart,
      periodEnd,
      status: 'DRAFT',
    },
  })
}
