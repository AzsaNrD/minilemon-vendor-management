'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Bell, Check, CheckCheck, Info, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from '@/components/ui/Dropdown'
import { cn, formatRelativeTime } from '@/lib/utils'
import { markAllNotificationsRead, markNotificationRead } from '@/actions/notifications'

interface Notification {
  id: string
  type: 'INFO' | 'ACTION' | 'SUCCESS' | 'WARNING'
  title: string
  body: string
  link: string | null
  isRead: boolean
  createdAt: string
}

const typeIcon = {
  INFO: <Info className="h-4 w-4 text-ink-500" />,
  ACTION: <AlertCircle className="h-4 w-4 text-lemon-600" />,
  SUCCESS: <CheckCircle2 className="h-4 w-4 text-leaf-500" />,
  WARNING: <AlertCircle className="h-4 w-4 text-coral-500" />,
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error('Failed to load notifications')
      return (await res.json()) as { data: Notification[]; unreadCount: number }
    },
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  })

  const items = data?.data ?? []
  const unreadCount = data?.unreadCount ?? 0

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id)
      refetch()
    })
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead()
      refetch()
    })
  }

  return (
    <Dropdown open={open} onOpenChange={setOpen}>
      <DropdownTrigger asChild>
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative rounded-lg p-2 text-ink-600 hover:bg-ink-50"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownTrigger>
      <DropdownContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
          <h3 className="font-display font-semibold text-ink-900">Notifikasi</h3>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-xs text-ink-600 hover:text-ink-900 inline-flex items-center gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Tandai semua dibaca
            </button>
          )}
        </div>
        <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
          {items.length === 0 ? (
            <p className="text-center text-sm text-ink-400 italic py-8">Belum ada notifikasi.</p>
          ) : (
            items.map((n) => {
              const Wrapper = ({ children }: { children: React.ReactNode }) =>
                n.link ? (
                  <Link
                    href={n.link}
                    onClick={() => {
                      if (!n.isRead) handleMarkRead(n.id)
                      setOpen(false)
                    }}
                    className={cn(
                      'block px-4 py-3 hover:bg-ink-50 transition-colors',
                      !n.isRead && 'bg-lemon-50/40',
                    )}
                  >
                    {children}
                  </Link>
                ) : (
                  <div className={cn('px-4 py-3', !n.isRead && 'bg-lemon-50/40')}>{children}</div>
                )
              return (
                <Wrapper key={n.id}>
                  <div className="flex gap-3">
                    <span className="mt-0.5 shrink-0">{typeIcon[n.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm', !n.isRead ? 'font-semibold text-ink-900' : 'text-ink-700')}>
                        {n.title}
                      </p>
                      <p className="text-xs text-ink-600 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-ink-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleMarkRead(n.id)
                        }}
                        className="shrink-0 rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                        aria-label="Tandai dibaca"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </Wrapper>
              )
            })
          )}
        </div>
      </DropdownContent>
    </Dropdown>
  )
}
