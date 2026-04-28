'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Card>
      <CardBody className="flex flex-col items-center text-center py-16 space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coral-100 text-coral-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-lg font-semibold text-ink-900">Gagal memuat halaman</h2>
          <p className="text-sm text-ink-600 max-w-md">
            {error.message || 'Terjadi kesalahan saat memuat data. Coba muat ulang halaman ini.'}
          </p>
        </div>
        <Button onClick={reset}>Coba lagi</Button>
      </CardBody>
    </Card>
  )
}
