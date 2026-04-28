'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { VENDOR_STATUS_LABEL } from '@/lib/constants'

const statusOptions = [
  { value: 'all', label: 'Semua status' },
  ...Object.entries(VENDOR_STATUS_LABEL).map(([value, label]) => ({ value, label })),
]

export function VendorListFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [, startTransition] = useTransition()
  const [q, setQ] = useState(sp.get('q') ?? '')

  function update(next: { q?: string; status?: string }) {
    const params = new URLSearchParams(sp.toString())
    if (next.q !== undefined) {
      next.q ? params.set('q', next.q) : params.delete('q')
    }
    if (next.status !== undefined) {
      next.status === 'all' ? params.delete('status') : params.set('status', next.status)
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          update({ q })
        }}
        className="relative flex-1 min-w-[240px]"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama, kode, atau email..."
          className="h-10 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm placeholder:text-ink-400 focus:border-lemon-500 focus:outline-none focus:ring-2 focus:ring-lemon-400"
        />
      </form>
      <div className="relative">
        <select
          defaultValue={sp.get('status') ?? 'all'}
          onChange={(e) => update({ status: e.target.value })}
          className="h-10 appearance-none rounded-lg border border-ink-200 bg-white pl-3 pr-9 text-sm focus:border-lemon-500 focus:outline-none focus:ring-2 focus:ring-lemon-400"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
      </div>
    </div>
  )
}
