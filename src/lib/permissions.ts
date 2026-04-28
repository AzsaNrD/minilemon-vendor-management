import { redirect } from 'next/navigation'
import { auth } from './auth'
import { prisma } from './prisma'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== 'ADMIN') redirect('/dashboard')
  return session
}

export async function requireVendor() {
  const session = await requireAuth()
  if (session.user.role !== 'VENDOR') redirect('/admin/dashboard')
  return session
}

export async function requireProjectAccess(projectId: string) {
  const session = await requireAuth()
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, vendorId: true },
  })
  if (!project) redirect('/404')
  if (session.user.role !== 'ADMIN' && project.vendorId !== session.user.vendorId) {
    redirect('/dashboard')
  }
  return { session, project }
}
