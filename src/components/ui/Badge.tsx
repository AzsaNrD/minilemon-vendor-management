import { cn } from '@/lib/utils'
import {
  VENDOR_STATUS_LABEL,
  VENDOR_STATUS_BADGE,
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_BADGE,
  DOC_STATUS_LABEL,
  DOC_STATUS_BADGE,
} from '@/lib/constants'

interface BadgeProps {
  label: string
  bg?: string
  text?: string
  dot?: string
  className?: string
}

export function Badge({ label, bg = 'bg-ink-100', text = 'text-ink-700', dot, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        bg,
        text,
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />}
      {label}
    </span>
  )
}

export function VendorStatusBadge({ status }: { status: keyof typeof VENDOR_STATUS_LABEL }) {
  const c = VENDOR_STATUS_BADGE[status]
  return <Badge label={VENDOR_STATUS_LABEL[status]} bg={c.bg} text={c.text} dot={c.dot} />
}

export function ProjectStatusBadge({ status }: { status: keyof typeof PROJECT_STATUS_LABEL }) {
  const c = PROJECT_STATUS_BADGE[status]
  return <Badge label={PROJECT_STATUS_LABEL[status]} bg={c.bg} text={c.text} dot={c.dot} />
}

export function DocStatusBadge({ status }: { status: keyof typeof DOC_STATUS_LABEL }) {
  const c = DOC_STATUS_BADGE[status]
  return <Badge label={DOC_STATUS_LABEL[status]} bg={c.bg} text={c.text} dot={c.dot} />
}
