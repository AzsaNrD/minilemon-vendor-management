import { ReactNode } from 'react'
import { requireVendor } from '@/lib/permissions'
import { VendorTopNav } from '@/components/layout/VendorTopNav'

export default async function VendorLayout({ children }: { children: ReactNode }) {
  const session = await requireVendor()
  return (
    <div className="min-h-screen bg-cream">
      <VendorTopNav
        fullName={session.user.name}
        email={session.user.email}
        vendorStatus={session.user.vendorStatus}
      />
      <main className="px-6 py-8 md:px-10">{children}</main>
    </div>
  )
}
