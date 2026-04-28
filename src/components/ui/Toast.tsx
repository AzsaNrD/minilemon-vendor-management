'use client'

import { createContext, useCallback, useContext, useState, ReactNode } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastContextValue {
  showToast: (title: string, variant?: ToastVariant, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const variantIcon: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-leaf-500" />,
  error: <AlertCircle className="h-5 w-5 text-coral-500" />,
  info: <Info className="h-5 w-5 text-ink-500" />,
  warning: <AlertCircle className="h-5 w-5 text-lemon-600" />,
}

const variantBorder: Record<ToastVariant, string> = {
  success: 'border-l-leaf-500',
  error: 'border-l-coral-500',
  info: 'border-l-ink-400',
  warning: 'border-l-lemon-500',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((title: string, variant: ToastVariant = 'info', description?: string) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, title, variant, description }])
  }, [])

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4500}>
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            onOpenChange={(open) => !open && dismiss(t.id)}
            className={cn(
              'flex items-start gap-3 rounded-xl border border-ink-100 border-l-4 bg-white p-4 shadow-pop',
              'data-[state=open]:animate-slide-up data-[swipe=end]:animate-fade-in',
              variantBorder[t.variant],
            )}
          >
            {variantIcon[t.variant]}
            <div className="flex-1 space-y-0.5">
              <ToastPrimitive.Title className="text-sm font-semibold text-ink-900">{t.title}</ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="text-xs text-ink-600">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close
              aria-label="Tutup"
              className="rounded p-0.5 text-ink-400 hover:bg-ink-100 hover:text-ink-800"
            >
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed top-4 right-4 z-[100] flex w-[360px] max-w-[100vw] flex-col gap-2 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}
