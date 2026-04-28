'use client'

import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

export const Dropdown = DropdownPrimitive.Root
export const DropdownTrigger = DropdownPrimitive.Trigger

export const DropdownContent = forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(({ className, align = 'end', sideOffset = 6, ...props }, ref) => (
  <DropdownPrimitive.Portal>
    <DropdownPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-48 rounded-xl border border-ink-100 bg-white p-1 shadow-pop animate-fade-in',
        className,
      )}
      {...props}
    />
  </DropdownPrimitive.Portal>
))
DropdownContent.displayName = 'DropdownContent'

export const DropdownItem = forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Item> & { destructive?: boolean }
>(({ className, destructive, ...props }, ref) => (
  <DropdownPrimitive.Item
    ref={ref}
    className={cn(
      'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none',
      'focus:bg-ink-50 focus:text-ink-900',
      destructive ? 'text-coral-600 focus:bg-coral-50' : 'text-ink-700',
      className,
    )}
    {...props}
  />
))
DropdownItem.displayName = 'DropdownItem'

export const DropdownSeparator = forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownPrimitive.Separator ref={ref} className={cn('my-1 h-px bg-ink-100', className)} {...props} />
))
DropdownSeparator.displayName = 'DropdownSeparator'

export const DropdownLabel = forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Label>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownPrimitive.Label
    ref={ref}
    className={cn('px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400', className)}
    {...props}
  />
))
DropdownLabel.displayName = 'DropdownLabel'
