import type { Case, CaseEventType, CaseStatus } from '@prisma/client'
import { prisma } from './index.js'

export async function createCase(data: {
  userId: string
  fotomultaIds: string[]
  defensesApplied: string[]
}): Promise<Case> {
  return prisma.case.create({
    data: {
      userId: data.userId,
      defensesApplied: data.defensesApplied,
      caseFotomultas: {
        create: data.fotomultaIds.map((fotomultaId) => ({ fotomultaId })),
      },
      events: {
        create: { type: 'CREATED' },
      },
    },
    include: { caseFotomultas: true },
  })
}

export async function updateCaseStatus(
  caseId: string,
  status: CaseStatus,
  eventType?: CaseEventType,
  details?: string,
): Promise<Case> {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.case.update({
      where: { id: caseId },
      data: { status },
    })

    if (eventType) {
      await tx.caseEvent.create({
        data: { caseId, type: eventType, details },
      })
    }

    return updated
  })
}

export async function storeCaseDocument(
  caseId: string,
  pdf: Uint8Array,
): Promise<Case> {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.case.update({
      where: { id: caseId },
      data: {
        documentPdf: new Uint8Array(pdf),
        status: 'DOCUMENT_READY',
      },
    })

    await tx.caseEvent.create({
      data: { caseId, type: 'DOCUMENT_GENERATED' },
    })

    return updated
  })
}

export async function getCaseWithDetails(caseId: string) {
  return prisma.case.findUnique({
    where: { id: caseId },
    include: {
      user: true,
      caseFotomultas: { include: { fotomulta: { include: { vehicle: true } } } },
      events: { orderBy: { createdAt: 'desc' } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })
}

export async function getCasesByUser(userId: string) {
  return prisma.case.findMany({
    where: { userId },
    include: {
      caseFotomultas: { include: { fotomulta: true } },
      events: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getCaseDocument(caseId: string): Promise<Uint8Array | null> {
  const result = await prisma.case.findUnique({
    where: { id: caseId },
    select: { documentPdf: true },
  })
  return result?.documentPdf ?? null
}
