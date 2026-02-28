import { businessDaysBetween } from '@fotoman/core/calendar'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params
  const url = new URL(req.url)
  const email = url.searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { prisma } = await import('@fotoman/db')

    const user = await prisma.user.findFirst({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const caseData = await prisma.case.findFirst({
      where: { id: caseId, userId: user.id },
      include: {
        caseFotomultas: {
          include: { fotomulta: { include: { vehicle: true } } },
        },
        events: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const today = new Date()
    const plate = caseData.caseFotomultas[0]?.fotomulta.vehicle.plate ?? 'N/A'
    const vehicleType = caseData.caseFotomultas[0]?.fotomulta.vehicle.type ?? ''

    let businessDaysElapsed: number | null = null
    let businessDaysRemaining: number | null = null
    let deadlineExpired = false

    if (caseData.submissionDate && caseData.deadlineDate) {
      businessDaysElapsed = businessDaysBetween(caseData.submissionDate, today)
      businessDaysRemaining = businessDaysBetween(today, caseData.deadlineDate)
      deadlineExpired = businessDaysRemaining <= 0 && caseData.status === 'AWAITING_RESPONSE'
    }

    return NextResponse.json({
      id: caseData.id,
      plate,
      vehicleType,
      status: caseData.status,
      defensesApplied: caseData.defensesApplied,
      submissionDate: caseData.submissionDate?.toISOString() ?? null,
      deadlineDate: caseData.deadlineDate?.toISOString() ?? null,
      businessDaysElapsed,
      businessDaysRemaining,
      deadlineExpired,
      createdAt: caseData.createdAt.toISOString(),
      fotomultas: caseData.caseFotomultas.map((cf) => ({
        comparendoNumber: cf.fotomulta.comparendoNumber,
        infractionCode: cf.fotomulta.infractionCode,
        infractionDescription: cf.fotomulta.infractionDescription,
        amount: cf.fotomulta.amount,
        applicableDefenses: caseData.defensesApplied,
      })),
      events: caseData.events.map((ev) => ({
        type: ev.type,
        details: ev.details,
        createdAt: ev.createdAt.toISOString(),
      })),
      submissionProof: caseData.submissionProof,
      authorityEmail: caseData.authorityEmail,
      hasDocument: caseData.documentPdf !== null,
    })
  } catch {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 })
  }
}
