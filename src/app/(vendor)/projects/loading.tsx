import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-64" />
      </header>
      <Card>
        <div className="divide-y divide-ink-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-4 px-5 py-4">
              <div className="col-span-6 space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="col-span-3 h-5 w-24 rounded-full" />
              <Skeleton className="col-span-3 h-3 w-16 ml-auto" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
