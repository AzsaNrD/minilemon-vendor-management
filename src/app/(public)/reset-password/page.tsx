import Link from 'next/link'
import { Card, CardBody } from '@/components/ui/Card'
import { ResetPasswordForm } from './ResetPasswordForm'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>
}) {
  const sp = await searchParams
  if (!sp.token || !sp.email) {
    return (
      <div className="w-full max-w-md text-center">
        <h1 className="font-display text-2xl font-bold text-ink-900">Tautan tidak valid</h1>
        <p className="mt-2 text-sm text-ink-600">Tautan reset password tidak ditemukan.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm font-medium text-ink-900 underline">
          Minta tautan baru
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900">Buat Password Baru</h1>
        <p className="mt-2 text-sm text-ink-600">Minimal 8 karakter, mengandung huruf dan angka.</p>
      </div>
      <Card>
        <CardBody>
          <ResetPasswordForm token={sp.token} email={sp.email} />
        </CardBody>
      </Card>
    </div>
  )
}
