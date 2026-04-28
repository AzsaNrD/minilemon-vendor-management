import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3'

async function main() {
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

  const allowedOrigins = (process.env.R2_CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001').split(',')

  await s3.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: allowedOrigins,
            AllowedMethods: ['GET', 'PUT', 'HEAD'],
            AllowedHeaders: ['*'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }),
  )

  console.log(`✓ CORS policy applied to bucket "${bucket}"`)
  console.log(`  Allowed origins: ${allowedOrigins.join(', ')}`)

  const current = await s3.send(new GetBucketCorsCommand({ Bucket: bucket }))
  console.log('\nCurrent CORS rules:')
  console.log(JSON.stringify(current.CORSRules, null, 2))
}

main().catch((e) => {
  console.error('Failed:', e?.name || '', e?.message || e)
  process.exit(1)
})
