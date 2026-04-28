import { S3Client, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

async function main() {
  const required = ['S3_ENDPOINT', 'S3_BUCKET', 'S3_ACCESS_KEY', 'S3_SECRET_KEY']
  for (const k of required) {
    if (!process.env[k]) {
      console.error(`Missing env: ${k}`)
      process.exit(1)
    }
  }

  const s3 = new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true,
  })

  const bucket = process.env.S3_BUCKET!
  const key = `_healthcheck/${Date.now()}.txt`
  const body = Buffer.from('hello from minilemon dashboard r2 healthcheck')

  console.log(`[1/4] Uploading test object to s3://${bucket}/${key}...`)
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: 'text/plain' }))
  console.log('      ✓ uploaded')

  console.log('[2/4] Verifying object exists...')
  const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
  console.log(`      ✓ size=${head.ContentLength} bytes, contentType=${head.ContentType}`)

  console.log('[3/4] Generating signed download URL...')
  const url = await getSignedUrl(s3, new HeadObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 60 })
  console.log(`      ✓ ${url.slice(0, 80)}...`)

  console.log('[4/4] Cleaning up test object...')
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
  console.log('      ✓ deleted')

  console.log('\nR2 connection OK ✓')
}

main().catch((e) => {
  console.error('R2 healthcheck FAILED:')
  console.error(e?.name || '', e?.message || e)
  process.exit(1)
})
