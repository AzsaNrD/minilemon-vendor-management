import Link from 'next/link'
import { ReactNode } from 'react'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-lemon-400 font-display font-bold text-lg">
            M
          </span>
          <span className="font-display text-lg font-semibold text-ink-900">Minilemon</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-10">{children}</main>
      <footer className="px-6 py-6 text-center text-xs text-ink-500">
        &copy; {new Date().getFullYear()} PT. Minilemon Kreasi Indonesia
      </footer>
    </div>
  )
}
