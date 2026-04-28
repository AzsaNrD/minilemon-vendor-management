'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({ open, onClose, title, description, size = 'md', children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl bg-white shadow-pop animate-slide-up max-h-[90vh] overflow-y-auto',
            sizes[size],
          )}
        >
          {(title || description) && (
            <div className="flex items-start justify-between border-b border-ink-100 px-6 py-4">
              <div className="space-y-0.5">
                {title && (
                  <Dialog.Title className="font-display text-lg font-semibold text-ink-900">{title}</Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="text-sm text-ink-600">{description}</Dialog.Description>
                )}
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-800"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          )}
          <div className="px-6 py-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
