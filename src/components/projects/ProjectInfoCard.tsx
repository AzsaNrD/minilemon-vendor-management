import Link from 'next/link'
import { CalendarDays, ExternalLink } from 'lucide-react'
import type { Project, Vendor } from '@prisma/client'
import { Card, CardBody } from '@/components/ui/Card'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface Props {
  project: Project & { vendor: Pick<Vendor, 'fullName' | 'vendorCode' | 'category'> }
  isAdmin: boolean
}

export function ProjectInfoCard({ project, isAdmin }: Props) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Brief</h2>
          <p className="mt-2 text-sm text-ink-700 whitespace-pre-wrap">{project.brief}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-ink-100">
          {isAdmin && (
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-500">Vendor</p>
              <p className="text-ink-900 mt-1">
                {project.vendor.fullName}{' '}
                <span className="text-xs text-ink-400">({project.vendor.vendorCode})</span>
              </p>
              {project.vendor.category && <p className="text-xs text-ink-500">{project.vendor.category}</p>}
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500 inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> Deadline Estimasi
            </p>
            <p className="text-ink-900 mt-1">
              {project.deadlineEstimate ? formatDate(project.deadlineEstimate) : '—'}
            </p>
          </div>
          {project.assetDriveLink && (
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-ink-500">Asset Drive Link</p>
              <Link
                href={project.assetDriveLink}
                target="_blank"
                className="mt-1 inline-flex items-center gap-1 text-sm text-leaf-600 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Buka di Drive
              </Link>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Dibuat</p>
            <p className="text-ink-900 mt-1">{formatDate(project.createdAt, { withTime: true })}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Update Terakhir</p>
            <p className="text-ink-900 mt-1">{formatRelativeTime(project.lastUpdatedAt)}</p>
          </div>
          {project.cancelledAt && (
            <div className="sm:col-span-2 rounded-lg bg-coral-50 p-3 text-sm text-coral-700">
              <p className="font-medium">Project dibatalkan</p>
              {project.cancelledReason && <p className="mt-1 text-xs">{project.cancelledReason}</p>}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
