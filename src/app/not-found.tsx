import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="text-center max-w-md">
        <p className="font-display text-6xl font-bold text-ink-900">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-ink-600">Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
        <Link href="/" className="inline-block mt-6">
          <Button>Kembali ke Beranda</Button>
        </Link>
      </div>
    </div>
  )
}
