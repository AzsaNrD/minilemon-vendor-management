import { prisma } from '@/lib/prisma'
import { getCompanyInfo } from '@/lib/nda'
import { getSignedDownloadUrl } from '@/lib/s3'
import { serializeQuotation } from '@/lib/quotation'
import { serializeInvoice } from '@/lib/invoice'
import { PROJECT_STATUS_LABEL } from '@/lib/constants'
import type { Prisma, ProjectStatus } from '@prisma/client'

export interface ListProjectsFilter {
  status?: string
  q?: string
}

export async function listAdminProjects(filter: ListProjectsFilter) {
  const where: Prisma.ProjectWhereInput = { deletedAt: null }
  if (filter.status && filter.status !== 'all' && filter.status in PROJECT_STATUS_LABEL) {
    where.status = filter.status as ProjectStatus
  }
  if (filter.q) {
    where.OR = [
      { name: { contains: filter.q, mode: 'insensitive' } },
      { vendor: { fullName: { contains: filter.q, mode: 'insensitive' } } },
    ]
  }

  return prisma.project.findMany({
    where,
    include: { vendor: { select: { fullName: true, vendorCode: true } } },
    orderBy: { lastUpdatedAt: 'desc' },
  })
}

export async function listVendorProjects(vendorId: string) {
  return prisma.project.findMany({
    where: { vendorId, deletedAt: null },
    orderBy: { lastUpdatedAt: 'desc' },
  })
}

export async function getProjectDetail(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      vendor: { select: { id: true, fullName: true, vendorCode: true, category: true } },
      quotations: { orderBy: { createdAt: 'desc' } },
      spk: true,
      invoice: true,
    },
  })
  if (!project) return null

  const { quotations: rawQuotations, spk, invoice: rawInvoice, ...projectInfo } = project
  const allQuotations = rawQuotations.map(serializeQuotation)
  const activeQuotation = allQuotations.find((q) => q.status !== 'SUPERSEDED') ?? allQuotations[0] ?? null
  const invoice = rawInvoice ? serializeInvoice(rawInvoice) : null

  const needsCompany = activeQuotation || spk || invoice
  const [company, vendorFull] = needsCompany
    ? await Promise.all([
        getCompanyInfo(),
        prisma.vendor.findUnique({ where: { id: project.vendorId } }),
      ])
    : [null, null]

  const [quoVendorSig, quoAdminSig, spkVendorSig, spkAdminSig, invVendorSig] = await Promise.all([
    activeQuotation?.vendorSignatureKey
      ? getSignedDownloadUrl(activeQuotation.vendorSignatureKey).catch(() => undefined)
      : undefined,
    activeQuotation?.adminSignatureKey
      ? getSignedDownloadUrl(activeQuotation.adminSignatureKey).catch(() => undefined)
      : undefined,
    spk?.vendorSignatureKey ? getSignedDownloadUrl(spk.vendorSignatureKey).catch(() => undefined) : undefined,
    spk?.adminSignatureKey ? getSignedDownloadUrl(spk.adminSignatureKey).catch(() => undefined) : undefined,
    invoice?.vendorSignatureKey
      ? getSignedDownloadUrl(invoice.vendorSignatureKey).catch(() => undefined)
      : undefined,
  ])

  return {
    project,
    projectInfo,
    allQuotations,
    activeQuotation,
    spk,
    invoice,
    company,
    vendorFull,
    signatureUrls: {
      quoVendor: quoVendorSig,
      quoAdmin: quoAdminSig,
      spkVendor: spkVendorSig,
      spkAdmin: spkAdminSig,
      invVendor: invVendorSig,
    },
  }
}

export async function getQuotationFormContext(projectId: string, vendorId: string, reviseId?: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { quotations: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })
  if (!project) return { project: null, parent: null, ownership: 'none' as const, status: 'invalid' as const }
  if (project.vendorId !== vendorId) return { project, parent: null, ownership: 'forbidden' as const, status: 'invalid' as const }
  if (!['QUOTATION_PENDING', 'QUOTATION_NEGOTIATION'].includes(project.status)) {
    return { project, parent: null, ownership: 'ok' as const, status: 'invalid' as const }
  }

  let parent = null
  if (reviseId) {
    const found = await prisma.quotation.findUnique({ where: { id: reviseId } })
    if (found && found.projectId === project.id) parent = found
  } else if (project.status === 'QUOTATION_NEGOTIATION') {
    parent = project.quotations.find((q) => q.status === 'REVISION_REQUESTED') ?? null
  }

  return { project, parent, ownership: 'ok' as const, status: 'ok' as const }
}

export async function getInvoiceFormContext(projectId: string, vendorId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      invoice: true,
      spk: true,
      vendor: true,
      quotations: { where: { status: 'SIGNED' }, take: 1 },
    },
  })
  if (!project) return { project: null, signedQuotation: null, gate: 'invalid' as const }
  if (project.vendorId !== vendorId) return { project, signedQuotation: null, gate: 'forbidden' as const }
  if (project.status !== 'IN_PROGRESS') return { project, signedQuotation: null, gate: 'invalid' as const }
  if (project.invoice) return { project, signedQuotation: null, gate: 'invalid' as const }
  if (!project.spk || project.spk.status !== 'SIGNED') return { project, signedQuotation: null, gate: 'invalid' as const }
  const signedQuotation = project.quotations[0]
  if (!signedQuotation) return { project, signedQuotation: null, gate: 'invalid' as const }

  return { project, signedQuotation, gate: 'ok' as const }
}
