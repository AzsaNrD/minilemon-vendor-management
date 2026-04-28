import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
}

const colors = [
  'bg-lemon-200 text-ink-900',
  'bg-leaf-100 text-leaf-600',
  'bg-coral-100 text-coral-600',
  'bg-ink-100 text-ink-700',
]

function colorFor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return colors[h % colors.length]
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold',
        colorFor(name),
        sizes[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  )
}
