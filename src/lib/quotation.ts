import type { Prisma, Quotation } from '@prisma/client'
import { getNextDocNumber } from './numbering'
import { calculateQuotationTotals, type QuotationItemInput } from '@/schemas/quotation'

/**
 * Plain-object form of Quotation (Decimal fields converted to number) so it
 * can be passed from a Server Component to a Client Component.
 */
export type SerializedQuotation = Omit<
  Quotation,
  'ppnPercent' | 'discount' | 'subtotal' | 'ppn' | 'grandTotal'
> & {
  ppnPercent: number
  discount: number
  subtotal: number
  ppn: number
  grandTotal: number
}

export function serializeQuotation(q: Quotation): SerializedQuotation {
  return {
    ...q,
    ppnPercent: Number(q.ppnPercent),
    discount: Number(q.discount),
    subtotal: Number(q.subtotal),
    ppn: Number(q.ppn),
    grandTotal: Number(q.grandTotal),
  }
}

interface CreateQuotationInput {
  projectId: string
  vendorId: string
  items: QuotationItemInput[]
  ppnEnabled: boolean
  ppnPercent?: number
  discount?: number
  notes?: string
  validityUntil: Date
  parentQuotationId?: string
}

export async function createQuotation(
  tx: Prisma.TransactionClient,
  input: CreateQuotationInput,
): Promise<Quotation> {
  const totals = calculateQuotationTotals(input)
  const docNumber = await getNextDocNumber('QTN')

  let version = 1
  if (input.parentQuotationId) {
    const parent = await tx.quotation.findUnique({ where: { id: input.parentQuotationId } })
    if (parent) {
      version = parent.version + 1
      // Mark all previous versions as superseded
      await tx.quotation.updateMany({
        where: {
          OR: [
            { id: input.parentQuotationId },
            { parentQuotationId: input.parentQuotationId },
          ],
          status: { in: ['REVISION_REQUESTED', 'SUBMITTED', 'NEGOTIATION'] },
        },
        data: { status: 'SUPERSEDED' },
      })
    }
  }

  return tx.quotation.create({
    data: {
      docNumber,
      projectId: input.projectId,
      vendorId: input.vendorId,
      version,
      parentQuotationId: input.parentQuotationId,
      items: input.items as any,
      ppnEnabled: input.ppnEnabled,
      ppnPercent: input.ppnPercent ?? 11,
      discount: totals.discount,
      subtotal: totals.subtotal,
      ppn: totals.ppn,
      grandTotal: totals.grandTotal,
      notes: input.notes,
      validityUntil: input.validityUntil,
      date: new Date(),
      status: 'SUBMITTED',
    },
  })
}
