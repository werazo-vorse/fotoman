import type { Message } from '@prisma/client'
import { prisma } from './index.js'

export async function saveMessage(data: {
  caseId: string
  role: string
  content: string
}): Promise<Message> {
  return prisma.message.create({ data })
}

export async function getMessagesByCase(caseId: string): Promise<Message[]> {
  return prisma.message.findMany({
    where: { caseId },
    orderBy: { createdAt: 'asc' },
  })
}
