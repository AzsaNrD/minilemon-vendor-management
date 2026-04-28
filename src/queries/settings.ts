import { prisma } from '@/lib/prisma'
import { getSignedDownloadUrl } from '@/lib/s3'

export async function getCompanySettings() {
  return prisma.companySettings.findUnique({ where: { id: 'singleton' } })
}

export async function getMasterSignatureContext() {
  const settings = await getCompanySettings()
  const currentUrl = settings?.adminMasterSignatureKey
    ? await getSignedDownloadUrl(settings.adminMasterSignatureKey).catch(() => undefined)
    : undefined
  return { settings, currentUrl }
}
