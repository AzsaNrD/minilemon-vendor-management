'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'NDA', label: 'NDA' },
  { value: 'QUOTATION', label: 'Quotation' },
  { value: 'SPK', label: 'SPK' },
  { value: 'INVOICE', label: 'Invoice' },
]

export function DocumentFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [, startTransition] = useTransition()
  const [q, setQ] = useState(sp.get('q') ?? '')
  const currentType = sp.get('type') ?? 'all'

  function update(next: { q?: string; type?: string }) {
    const params = new URLSearchParams(sp.toString())
    if (next.q !== undefined) {
      next.q ? params.set('q', next.q) : params.delete('q')
    }
    if (next.type !== undefined) {
      next.type === 'all' ? params.delete('type') : params.set('type', next.type)
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          update({ q })
        }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nomor dokumen..."
          className="h-10 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm placeholder:text-ink-400 focus:border-lemon-500 focus:outline-none focus:ring-2 focus:ring-lemon-400"
        />
      </form>
      <div className="flex flex-wrap gap-2">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => update({ type: opt.value })}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              currentType === opt.value
                ? 'bg-ink-900 text-lemon-400'
                : 'bg-white border border-ink-200 text-ink-700 hover:bg-ink-50',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
