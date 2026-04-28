import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Readable } from 'stream'

let s3Client: S3Client | null = null

function getClient(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      forcePathStyle: true,
    })
  }
  return s3Client
}

const BUCKET = () => process.env.S3_BUCKET || 'minilemon'

export async function getSignedUploadUrl(key: string, contentType: string, expiresIn = 300) {
  const cmd = new PutObjectCommand({ Bucket: BUCKET(), Key: key, ContentType: contentType })
  return getSignedUrl(getClient(), cmd, { expiresIn })
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET(), Key: key })
  return getSignedUrl(getClient(), cmd, { expiresIn })
}

export async function s3ObjectExists(key: string): Promise<boolean> {
  try {
    await getClient().send(new HeadObjectCommand({ Bucket: BUCKET(), Key: key }))
    return true
  } catch {
    return false
  }
}

export async function getS3Object(key: string): Promise<Buffer> {
  const res = await getClient().send(new GetObjectCommand({ Bucket: BUCKET(), Key: key }))
  const stream = res.Body as Readable
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks)
}

export async function putS3Object(key: string, body: Buffer | Uint8Array, contentType: string) {
  await getClient().send(new PutObjectCommand({ Bucket: BUCKET(), Key: key, Body: body, ContentType: contentType }))
}

type UploadKind = 'KTP' | 'SIGNATURE' | 'LOGO'

export function generateFileKey(kind: UploadKind, userId: string, mimeType: string): string {
  const ext = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1]
  const uuid = crypto.randomUUID()
  switch (kind) {
    case 'KTP':
      return `ktp/${userId}/${uuid}.${ext}`
    case 'SIGNATURE':
      return `signatures/${userId}/${uuid}.${ext}`
    case 'LOGO':
      return `company/logo-${uuid}.${ext}`
  }
}
