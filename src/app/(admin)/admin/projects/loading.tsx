import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </header>

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 px-5 py-4">
          <Skeleton className="h-9 flex-1 min-w-[200px] rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="divide-y divide-ink-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-4 px-5 py-4">
              <div className="col-span-5 space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="col-span-3 h-3 w-32" />
              <Skeleton className="col-span-2 h-5 w-24 rounded-full" />
              <Skeleton className="col-span-2 h-3 w-16 ml-auto" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
