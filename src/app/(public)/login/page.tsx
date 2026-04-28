import Link from 'next/link'
import { LoginForm } from './LoginForm'
import { Card, CardBody } from '@/components/ui/Card'

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900">Masuk ke Dashboard</h1>
        <p className="mt-2 text-sm text-ink-600">Gunakan email dan password yang Anda terima dari Minilemon.</p>
      </div>
      <Card>
        <CardBody>
          <LoginFormWrapper searchParams={searchParams} />
        </CardBody>
      </Card>
      <p className="mt-4 text-center text-sm text-ink-600">
        Lupa password?{' '}
        <Link href="/forgot-password" className="font-medium text-ink-900 underline underline-offset-2">
          Reset di sini
        </Link>
      </p>
    </div>
  )
}

async function LoginFormWrapper({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams
  return <LoginForm initialError={mapError(sp.error)} />
}

function mapError(code?: string): string | undefined {
  if (!code) return
  if (code === 'CredentialsSignin') return 'Email atau password salah.'
  if (code === 'account_disabled') return 'Akun Anda dinonaktifkan. Hubungi admin.'
  return 'Terjadi kesalahan saat login.'
}
