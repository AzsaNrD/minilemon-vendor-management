'use client'

import { MoreVertical, Power, RefreshCw, PowerOff } from 'lucide-react'
import { useTransition } from 'react'
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/Dropdown'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { disableVendor, enableVendor, resendInvite } from '@/actions/vendors'
import type { VendorStatus } from '@prisma/client'

interface Props {
  vendorId: string
  status: VendorStatus
  userActive: boolean
}

export function VendorActionsMenu({ vendorId, status, userActive }: Props) {
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const result = await fn()
      if (!result.ok) {
        showToast(result.error || 'Aksi gagal', 'error')
        return
      }
      showToast(success, 'success')
    })
  }

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending}>
          <MoreVertical className="h-4 w-4" /> Aksi
        </Button>
      </DropdownTrigger>
      <DropdownContent>
        {status === 'PENDING_PROFILE' && (
          <DropdownItem onSelect={() => run(() => resendInvite(vendorId), 'Undangan dikirim ulang')}>
            <RefreshCw className="h-4 w-4" />
            Kirim Ulang Undangan
          </DropdownItem>
        )}
        {userActive ? (
          <DropdownItem
            destructive
            onSelect={() => run(() => disableVendor(vendorId), 'Vendor dinonaktifkan')}
          >
            <PowerOff className="h-4 w-4" />
            Nonaktifkan
          </DropdownItem>
        ) : (
          <DropdownItem onSelect={() => run(() => enableVendor(vendorId), 'Vendor diaktifkan')}>
            <Power className="h-4 w-4" />
            Aktifkan
          </DropdownItem>
        )}
      </DropdownContent>
    </Dropdown>
  )
}
