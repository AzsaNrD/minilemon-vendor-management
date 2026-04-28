import { prisma } from '@/lib/prisma'
import { getSignedDownloadUrl } from '@/lib/s3'

export async function getVendorProfile(userId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    include: { user: { select: { email: true } } },
  })
  if (!vendor) return null

  const ktpPreviewUrl = vendor.ktpFileKey
    ? await getSignedDownloadUrl(vendor.ktpFileKey).catch(() => undefined)
    : undefined

  return { vendor, ktpPreviewUrl }
}
