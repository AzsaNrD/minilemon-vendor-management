import { prisma } from './prisma'

type DocType = 'NDA' | 'QTN' | 'SPK' | 'INV'

export async function getNextDocNumber(type: DocType, vendorCode?: string): Promise<string> {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')

  let counterKey: string
  let padLength: number

  switch (type) {
    case 'NDA':
      counterKey = `NDA-${yyyy}-${mm}`
      padLength = 3
      break
    case 'QTN':
      counterKey = `QTN-${yyyy}-${mm}`
      padLength = 3
      break
    case 'SPK':
      counterKey = `SPK-${yyyy}`
      padLength = 4
      break
    case 'INV':
      if (!vendorCode) throw new Error('vendorCode required for INV')
      counterKey = `INV-${vendorCode}-${yyyy}${mm}`
      padLength = 3
      break
  }

  const counter = await prisma.documentCounter.upsert({
    where: { id: counterKey },
    create: { id: counterKey, count: 1 },
    update: { count: { increment: 1 } },
  })

  const padded = String(counter.count).padStart(padLength, '0')

  switch (type) {
    case 'NDA':
      return `NDA/MLA/${yyyy}/${mm}/${padded}`
    case 'QTN':
      return `QTN/MLA/${yyyy}/${mm}/${padded}`
    case 'SPK':
      return `${padded}/SPK-MLA/${yyyy}`
    case 'INV':
      return `INV/${vendorCode}/${yyyy}${mm}/${padded}`
  }
}

export async function generateVendorCode(fullName: string): Promise<string> {
  const base = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3) || 'VND'
  let code = base
  let i = 2
  while (await prisma.vendor.findUnique({ where: { vendorCode: code } })) {
    code = `${base}${i++}`
  }
  return code
}
