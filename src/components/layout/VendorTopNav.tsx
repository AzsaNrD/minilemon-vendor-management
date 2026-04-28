'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserMenu } from './UserMenu'
import { NotificationBell } from './NotificationBell'

interface VendorTopNavProps {
  fullName: string
  email: string
  vendorStatus?: string
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projects', label: 'Projects' },
  { href: '/documents', label: 'Documents' },
  { href: '/profile', label: 'Profil' },
]

export function VendorTopNav({ fullName, email, vendorStatus }: VendorTopNavProps) {
  const pathname = usePathname()
  const fullyOnboarded = vendorStatus === 'ACTIVE'

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-6 px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-lemon-400 font-display font-bold">
            M
          </span>
          <span className="hidden sm:block font-display text-lg font-semibold">Minilemon</span>
        </Link>
        {fullyOnboarded && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-ink-900 text-lemon-400' : 'text-ink-700 hover:bg-ink-50',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2">
          {fullyOnboarded && <NotificationBell />}
          <UserMenu fullName={fullName} email={email} role="VENDOR" />
        </div>
      </div>
    </header>
  )
}
