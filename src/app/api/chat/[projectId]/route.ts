import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user) return new Response('Unauthorized', { status: 401 })

  const { projectId } = await params
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, vendorId: true },
  })
  if (!project) return new Response('Not found', { status: 404 })
  if (session.user.role !== 'ADMIN' && project.vendorId !== session.user.vendorId) {
    return new Response('Forbidden', { status: 403 })
  }

  const url = new URL(req.url)
  const since = url.searchParams.get('since')

  const messages = await prisma.chatMessage.findMany({
    where: {
      projectId,
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
    include: { sender: { select: { id: true, fullName: true, role: true } } },
  })

  return Response.json({ data: messages })
}
