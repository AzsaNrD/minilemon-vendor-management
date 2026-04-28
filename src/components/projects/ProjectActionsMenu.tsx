'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/Dropdown'
import { cancelProject } from '@/actions/projects'

const FINAL = ['COMPLETED', 'CANCELLED']

export function ProjectActionsMenu({ projectId, status }: { projectId: string; status: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()

  if (FINAL.includes(status)) return null

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelProject(projectId, { reason: reason.trim() })
      if (!result.ok) {
        showToast(result.error, 'error')
        return
      }
      showToast('Project dibatalkan', 'success')
      setOpen(false)
      setReason('')
      router.refresh()
    })
  }

  return (
    <>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
            Aksi
          </Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem destructive onSelect={() => setOpen(true)}>
            <XCircle className="h-4 w-4" />
            Batalkan Project
          </DropdownItem>
        </DropdownContent>
      </Dropdown>

      <Modal
        open={open}
        onClose={() => !isPending && setOpen(false)}
        title="Batalkan Project"
        description="Vendor akan menerima notifikasi dengan alasan pembatalan. Aksi ini tidak bisa di-undo."
      >
        <div className="space-y-3">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            label="Alasan pembatalan"
            placeholder="Jelaskan alasan dibatalkannya project ini..."
            rows={4}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleCancel} loading={isPending} disabled={reason.trim().length < 5}>
              Ya, Batalkan Project
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
