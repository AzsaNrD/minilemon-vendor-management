import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Fraunces, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Minilemon Vendor Dashboard',
  description: 'Vendor management dashboard untuk PT. Minilemon Kreasi Indonesia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="font-sans bg-cream text-ink-900 min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
