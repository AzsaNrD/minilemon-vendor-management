import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-lemon-400 hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-lemon-400 focus-visible:ring-offset-2',
  secondary: 'bg-lemon-400 text-ink-900 hover:bg-lemon-500 focus-visible:ring-2 focus-visible:ring-ink-900',
  outline:
    'border border-ink-200 bg-white text-ink-800 hover:bg-ink-50 focus-visible:ring-2 focus-visible:ring-ink-400',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100',
  danger: 'bg-coral-500 text-white hover:bg-coral-600 focus-visible:ring-2 focus-visible:ring-coral-400',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
