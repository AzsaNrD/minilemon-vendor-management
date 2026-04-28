import Link from 'next/link'
import { Card, CardBody } from '@/components/ui/Card'
import { ForgotPasswordForm } from './ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900">Reset Password</h1>
        <p className="mt-2 text-sm text-ink-600">
          Masukkan email Anda. Jika terdaftar, kami akan kirim tautan reset.
        </p>
      </div>
      <Card>
        <CardBody>
          <ForgotPasswordForm />
        </CardBody>
      </Card>
      <p className="mt-4 text-center text-sm text-ink-600">
        <Link href="/login" className="font-medium text-ink-900 underline underline-offset-2">
          Kembali ke login
        </Link>
      </p>
    </div>
  )
}
