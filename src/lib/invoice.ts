import type { Invoice } from '@prisma/client'

export type SerializedInvoice = Omit<Invoice, 'amount'> & { amount: number }

export function serializeInvoice(inv: Invoice): SerializedInvoice {
  return { ...inv, amount: Number(inv.amount) }
}
