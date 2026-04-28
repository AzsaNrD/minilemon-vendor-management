'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Settings,
  Building2,
  PenLine,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/vendors', label: 'Vendors', icon: Users },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/documents', label: 'Documents', icon: FileText },
]

const settingsItems = [
  { href: '/admin/settings/signature', label: 'Master Signature', icon: PenLine },
  { href: '/admin/settings/company', label: 'Company Info', icon: Building2 },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-ink-100 bg-white">
      <div className="px-6 py-6 border-b border-ink-100">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-lemon-400 font-display font-bold">
            M
          </span>
          <span className="font-display text-lg font-semibold">Minilemon</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href) ? 'bg-ink-900 text-lemon-400' : 'text-ink-700 hover:bg-ink-50',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}

        <div className="pt-4">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-ink-400 inline-flex items-center gap-1">
            <Settings className="h-3 w-3" /> Settings
          </p>
          {settingsItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href) ? 'bg-ink-900 text-lemon-400' : 'text-ink-700 hover:bg-ink-50',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
      <div className="px-6 py-4 border-t border-ink-100 text-xs text-ink-400">v0.1.0 · Admin</div>
    </aside>
  )
}
