import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { generateFileKey, getSignedUploadUrl } from '@/lib/s3'
import { FILE_LIMITS } from '@/lib/constants'

const schema = z.object({
  kind: z.enum(['KTP', 'SIGNATURE', 'LOGO']),
  mimeType: z.string(),
  sizeBytes: z.number().int().positive(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.user.role === 'VENDOR') {
    // Vendors cannot upload company logo
    const body = await req.clone().json().catch(() => null)
    if (body?.kind === 'LOGO') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } else if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { kind, mimeType, sizeBytes } = parsed.data
  const limit = FILE_LIMITS[kind]

  if (!limit.allowedMime.includes(mimeType as any)) {
    return NextResponse.json({ error: `Tipe file tidak didukung untuk ${kind}` }, { status: 400 })
  }
  if (sizeBytes > limit.maxSize) {
    return NextResponse.json(
      { error: `File terlalu besar. Maksimal ${limit.maxSize / 1024 / 1024}MB` },
      { status: 400 },
    )
  }

  const fileKey = generateFileKey(kind, session.user.id, mimeType)
  const uploadUrl = await getSignedUploadUrl(fileKey, mimeType, 300)

  return NextResponse.json({ uploadUrl, fileKey, expiresIn: 300 })
}
