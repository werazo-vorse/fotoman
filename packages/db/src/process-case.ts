import type { Case } from '@prisma/client'
import { prisma } from './index.js'

export interface ProcessCaseInput {
  userData: {
    name: string
    cedula: string
    email: string
    phone: string
    address: string
  }
  vehicle: {
    plate: string
    type: string
    brand: string
  }
  fotomultas: {
    comparendoNumber: string
    resolutionNumber: string | null
    infractionDate: string
    notificationDate: string | null
    infractionCode: string
    infractionDescription: string
    amount: number
  }[]
  defensesApplied: string[]
  pdf: Uint8Array
  paymentReference: string
  authorityEmail: string
  submissionProof: string
  submissionMessageId?: string
  submissionDate: Date
  deadlineDate: Date
}

export async function createFullCase(input: ProcessCaseInput): Promise<Case> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { cedula: input.userData.cedula },
      update: {
        name: input.userData.name,
        email: input.userData.email,
        phone: input.userData.phone,
        address: input.userData.address,
      },
      create: {
        name: input.userData.name,
        cedula: input.userData.cedula,
        email: input.userData.email,
        phone: input.userData.phone,
        address: input.userData.address,
        platform: 'WEB',
      },
    })

    const vehicle = await tx.vehicle.upsert({
      where: { plate: input.vehicle.plate },
      update: {
        type: input.vehicle.type,
        brand: input.vehicle.brand,
      },
      create: {
        plate: input.vehicle.plate,
        type: input.vehicle.type,
        brand: input.vehicle.brand,
        ownerId: user.id,
      },
    })

    const fotomultaIds: string[] = []
    for (const f of input.fotomultas) {
      const fotomulta = await tx.fotomulta.upsert({
        where: { comparendoNumber: f.comparendoNumber },
        update: {},
        create: {
          comparendoNumber: f.comparendoNumber,
          resolutionNumber: f.resolutionNumber,
          infractionDate: new Date(f.infractionDate),
          notificationDate: f.notificationDate ? new Date(f.notificationDate) : null,
          infractionCode: f.infractionCode,
          infractionDescription: f.infractionDescription,
          amount: f.amount,
          vehicleId: vehicle.id,
        },
      })
      fotomultaIds.push(fotomulta.id)
    }

    const newCase = await tx.case.create({
      data: {
        userId: user.id,
        status: 'SUBMITTED',
        defensesApplied: input.defensesApplied,
        documentPdf: Buffer.from(input.pdf),
        paymentId: input.paymentReference,
        authorityEmail: input.authorityEmail,
        submissionDate: input.submissionDate,
        submissionProof: input.submissionProof,
        submissionMessageId: input.submissionMessageId,
        deadlineDate: input.deadlineDate,
        caseFotomultas: {
          create: fotomultaIds.map((fotomultaId) => ({ fotomultaId })),
        },
        events: {
          createMany: {
            data: [
              { type: 'CREATED' },
              { type: 'DOCUMENT_GENERATED' },
              { type: 'PAYMENT_RECEIVED', details: `Ref: ${input.paymentReference}` },
              { type: 'SUBMITTED', details: `Enviado a ${input.authorityEmail}` },
            ],
          },
        },
      },
    })

    return newCase
  })
}
