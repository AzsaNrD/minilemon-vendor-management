'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="text-center max-w-md">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Terjadi kesalahan</h1>
        <p className="mt-2 text-sm text-ink-600">{error.message || 'Sesuatu tidak berjalan sesuai harapan.'}</p>
        <Button onClick={reset} className="mt-6">
          Coba lagi
        </Button>
      </div>
    </div>
  )
}
