'use client'

import { signOut } from 'next-auth/react'
import { ChevronDown, LogOut, User } from 'lucide-react'
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
} from '@/components/ui/Dropdown'
import { Avatar } from '@/components/ui/Avatar'
import Link from 'next/link'

interface Props {
  fullName: string
  email: string
  role: 'ADMIN' | 'VENDOR'
}

export function UserMenu({ fullName, email, role }: Props) {
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ink-50">
          <Avatar name={fullName} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-ink-900 leading-tight">{fullName}</p>
            <p className="text-xs text-ink-500 leading-tight">{role === 'ADMIN' ? 'Admin' : 'Vendor'}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-ink-400" />
        </button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownLabel>{email}</DropdownLabel>
        <DropdownSeparator />
        {role === 'VENDOR' && (
          <DropdownItem asChild>
            <Link href="/profile">
              <User className="h-4 w-4" />
              Profil Saya
            </Link>
          </DropdownItem>
        )}
        <DropdownItem destructive onSelect={() => signOut({ callbackUrl: '/login' })}>
          <LogOut className="h-4 w-4" />
          Keluar
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  )
}
