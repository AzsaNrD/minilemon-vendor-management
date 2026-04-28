import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardBody } from '@/components/ui/Card'
import { FirstLoginForm } from './FirstLoginForm'

export default async function FirstLoginPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!session.user.mustChangePassword) {
    redirect(session.user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900">Atur Password Baru</h1>
        <p className="mt-2 text-sm text-ink-600">
          Sebelum melanjutkan, mohon ganti password sementara Anda dengan password baru yang aman.
        </p>
      </div>
      <Card>
        <CardBody>
          <FirstLoginForm />
        </CardBody>
      </Card>
    </div>
  )
}
