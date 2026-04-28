import { PrismaClient, VendorStatus } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')

  await prisma.user.upsert({
    where: { email: 'admin@minilemon.id' },
    create: {
      email: 'admin@minilemon.id',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
      fullName: 'Minilemon Team',
      isActive: true,
      mustChangePassword: false,
    },
    update: {},
  })

  await prisma.companySettings.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      name: 'PT. Minilemon Kreasi Indonesia',
      address: 'Jalan Mulyosari Timur No 42 Surabaya',
      phone: '+62 895-3341-10951',
      email: 'hello@minilemon.id',
      directorName: 'Gersom Halsamer',
      directorTitle: 'Direktur Utama',
    },
    update: {},
  })

  const sampleVendors: Array<{
    fullName: string
    email: string
    code: string
    status: VendorStatus
    category: string
  }> = [
    { fullName: 'Andika Abdurochim', email: 'andika@gmail.com', code: 'AND', status: 'ACTIVE', category: '3D Modeling' },
    {
      fullName: 'Bagus Pratama',
      email: 'bagus@gmail.com',
      code: 'BAG',
      status: 'PENDING_ADMIN_SIGN',
      category: 'Sound Designer',
    },
    { fullName: 'Rini Putri', email: 'rini@gmail.com', code: 'RIN', status: 'ACTIVE', category: 'Voice Talent' },
    { fullName: 'Dimas Aji', email: 'dimas@gmail.com', code: 'DIM', status: 'ACTIVE', category: 'Animator' },
    { fullName: 'Rina Sari', email: 'rina@gmail.com', code: 'RIS', status: 'ACTIVE', category: 'Background Artist' },
    {
      fullName: 'Hendra Wijaya',
      email: 'hendra@gmail.com',
      code: 'HEN',
      status: 'ACTIVE',
      category: 'Sound Engineer',
    },
    {
      fullName: 'Sari Wulandari',
      email: 'sari@gmail.com',
      code: 'SAR',
      status: 'PENDING_PROFILE',
      category: 'Storyboard Artist',
    },
  ]

  for (const v of sampleVendors) {
    const passwordHash = await bcrypt.hash('vendor123', 10)
    const user = await prisma.user.upsert({
      where: { email: v.email },
      create: {
        email: v.email,
        passwordHash,
        role: 'VENDOR',
        fullName: v.fullName,
        mustChangePassword: v.status === 'PENDING_PROFILE',
      },
      update: {},
    })

    await prisma.vendor.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        vendorCode: v.code,
        fullName: v.fullName,
        category: v.category,
        status: v.status,
        ...(v.status === 'ACTIVE' && {
          nik: '3471022312940000',
          address: 'Jakarta',
          phone: '+62 813 0000 0000',
          bankName: 'BCA',
          bankAccountNo: '1234567890',
          bankAccountHolder: v.fullName,
          ktpFileKey: `ktp/seed/${v.code.toLowerCase()}.jpg`,
          profileCompletedAt: new Date(),
          activatedAt: new Date(),
        }),
      },
      update: {},
    })
  }

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
