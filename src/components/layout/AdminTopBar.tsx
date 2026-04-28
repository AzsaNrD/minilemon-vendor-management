import { Bell } from 'lucide-react'
import { auth } from '@/lib/auth'
import { UserMenu } from './UserMenu'

export async function AdminTopBar() {
  const session = await auth()
  if (!session?.user) return null

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-ink-100 bg-white/95 backdrop-blur px-6">
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative rounded-lg p-2 text-ink-600 hover:bg-ink-50"
        >
          <Bell className="h-5 w-5" />
        </button>
        <UserMenu fullName={session.user.name} email={session.user.email} role={session.user.role} />
      </div>
    </header>
  )
}
