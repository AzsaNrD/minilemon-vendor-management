export const APP_NAME = 'Minilemon Vendor Dashboard'

export const VENDOR_STATUS_LABEL = {
  PENDING_PROFILE: 'Menunggu Biodata',
  PENDING_NDA_SIGN: 'Menunggu TTD NDA',
  PENDING_ADMIN_SIGN: 'Menunggu TTD Admin',
  ACTIVE: 'Aktif',
  INACTIVE: 'Nonaktif',
} as const

export const VENDOR_STATUS_BADGE = {
  PENDING_PROFILE: { bg: 'bg-ink-100', text: 'text-ink-700', dot: 'bg-ink-400' },
  PENDING_NDA_SIGN: { bg: 'bg-lemon-100', text: 'text-ink-800', dot: 'bg-lemon-500' },
  PENDING_ADMIN_SIGN: { bg: 'bg-lemon-100', text: 'text-ink-800', dot: 'bg-lemon-500' },
  ACTIVE: { bg: 'bg-leaf-100', text: 'text-leaf-600', dot: 'bg-leaf-500' },
  INACTIVE: { bg: 'bg-ink-100', text: 'text-ink-500', dot: 'bg-ink-400' },
} as const

export const PROJECT_STATUS_LABEL = {
  DRAFT: 'Draft',
  QUOTATION_PENDING: 'Menunggu Quotation',
  QUOTATION_SUBMITTED: 'Quotation Diajukan',
  QUOTATION_NEGOTIATION: 'Negosiasi',
  QUOTATION_SIGNED: 'Quotation Disetujui',
  SPK_PENDING_SIGN: 'Menunggu TTD SPK',
  IN_PROGRESS: 'Sedang Dikerjakan',
  INVOICE_SUBMITTED: 'Invoice Diajukan',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
} as const

export const PROJECT_STATUS_BADGE = {
  DRAFT: { bg: 'bg-ink-100', text: 'text-ink-700', dot: 'bg-ink-400' },
  QUOTATION_PENDING: { bg: 'bg-lemon-100', text: 'text-ink-800', dot: 'bg-lemon-500' },
  QUOTATION_SUBMITTED: { bg: 'bg-lemon-100', text: 'text-ink-800', dot: 'bg-lemon-500' },
  QUOTATION_NEGOTIATION: { bg: 'bg-coral-100', text: 'text-coral-600', dot: 'bg-coral-500' },
  QUOTATION_SIGNED: { bg: 'bg-leaf-100', text: 'text-leaf-600', dot: 'bg-leaf-500' },
  SPK_PENDING_SIGN: { bg: 'bg-lemon-100', text: 'text-ink-800', dot: 'bg-lemon-500' },
  IN_PROGRESS: { bg: 'bg-leaf-100', text: 'text-leaf-600', dot: 'bg-leaf-500' },
  INVOICE_SUBMITTED: { bg: 'bg-lemon-100', text: 'text-ink-800', dot: 'bg-lemon-500' },
  COMPLETED: { bg: 'bg-leaf-100', text: 'text-leaf-600', dot: 'bg-leaf-500' },
  CANCELLED: { bg: 'bg-coral-100', text: 'text-coral-600', dot: 'bg-coral-500' },
} as const

export const DOC_STATUS_LABEL = {
  DRAFT: 'Draft',
  PENDING_VENDOR_SIGN: 'Menunggu TTD Vendor',
  PENDING_ADMIN_SIGN: 'Menunggu TTD Admin',
  SIGNED: 'Telah Ditandatangani',
  SUBMITTED: 'Diajukan',
  APPROVED: 'Disetujui',
  REVISION_REQUESTED: 'Perlu Revisi',
  NEGOTIATION: 'Negosiasi',
  SUPERSEDED: 'Digantikan',
} as const

export const DOC_STATUS_BADGE = {
  DRAFT: { bg: 'bg-ink-100', text: 'text-ink-700', dot: 'bg-ink-400' },
  PENDING_VENDOR_SIGN: { bg: 'bg-lemon-100', text: 'text-ink-800', dot: 'bg-lemon-500' },
  PENDING_ADMIN_SIGN: { bg: 'bg-lemon-100', text: 'text-ink-800', dot: 'bg-lemon-500' },
  SIGNED: { bg: 'bg-leaf-100', text: 'text-leaf-600', dot: 'bg-leaf-500' },
  SUBMITTED: { bg: 'bg-lemon-100', text: 'text-ink-800', dot: 'bg-lemon-500' },
  APPROVED: { bg: 'bg-leaf-100', text: 'text-leaf-600', dot: 'bg-leaf-500' },
  REVISION_REQUESTED: { bg: 'bg-coral-100', text: 'text-coral-600', dot: 'bg-coral-500' },
  NEGOTIATION: { bg: 'bg-coral-100', text: 'text-coral-600', dot: 'bg-coral-500' },
  SUPERSEDED: { bg: 'bg-ink-100', text: 'text-ink-500', dot: 'bg-ink-400' },
} as const

export const IN_PROGRESS_STATUSES = [
  'QUOTATION_PENDING',
  'QUOTATION_SUBMITTED',
  'QUOTATION_NEGOTIATION',
  'QUOTATION_SIGNED',
  'SPK_PENDING_SIGN',
  'IN_PROGRESS',
  'INVOICE_SUBMITTED',
] as const

export const FILE_LIMITS = {
  KTP: { maxSize: 2 * 1024 * 1024, allowedMime: ['image/jpeg', 'image/png'] },
  SIGNATURE: { maxSize: 1 * 1024 * 1024, allowedMime: ['image/png', 'image/jpeg'] },
  LOGO: { maxSize: 512 * 1024, allowedMime: ['image/png', 'image/svg+xml'] },
} as const

export const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'] as const
