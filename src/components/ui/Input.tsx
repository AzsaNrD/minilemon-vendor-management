import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FieldWrapperProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
  htmlFor?: string
}

export function FieldWrapper({ label, hint, error, required, className, children, htmlFor }: FieldWrapperProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-800">
          {label}
          {required && <span className="text-coral-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-coral-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  )
}

const baseField =
  'w-full rounded-lg border bg-white text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-lemon-400 focus:border-lemon-500 disabled:bg-ink-50 disabled:text-ink-400'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, required, id, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <FieldWrapper label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={cn(
            baseField,
            'h-10 px-3',
            error && 'border-coral-500 focus:border-coral-500 focus:ring-coral-300',
            !error && 'border-ink-200',
            className,
          )}
          {...props}
        />
      </FieldWrapper>
    )
  },
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, required, id, rows = 4, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <FieldWrapper label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          required={required}
          className={cn(
            baseField,
            'px-3 py-2 resize-y',
            error && 'border-coral-500 focus:border-coral-500 focus:ring-coral-300',
            !error && 'border-ink-200',
            className,
          )}
          {...props}
        />
      </FieldWrapper>
    )
  },
)
Textarea.displayName = 'Textarea'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, required, options, id, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <FieldWrapper label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
        <select
          ref={ref}
          id={inputId}
          required={required}
          className={cn(
            baseField,
            'h-10 px-3',
            error && 'border-coral-500 focus:border-coral-500 focus:ring-coral-300',
            !error && 'border-ink-200',
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FieldWrapper>
    )
  },
)
Select.displayName = 'Select'
