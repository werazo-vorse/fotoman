import { businessDaysBetween } from '@fotoman/core/calendar'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const email = url.searchParams.get('email')

  if (!email) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    const { prisma } = await import('@fotoman/db')

    const user = await prisma.user.findFirst({ where: { email } })
    if (!user) return NextResponse.json([])

    const cases = await prisma.case.findMany({
      where: { userId: user.id },
      include: {
        caseFotomultas: {
          include: { fotomulta: { include: { vehicle: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const today = new Date()

    const result = cases.map((c) => {
      const plate = c.caseFotomultas[0]?.fotomulta.vehicle.plate ?? 'N/A'
      const vehicleType = c.caseFotomultas[0]?.fotomulta.vehicle.type ?? ''

      let businessDaysRemaining: number | null = null
      let deadlineExpired = false

      if (c.deadlineDate) {
        const remaining = businessDaysBetween(today, c.deadlineDate)
        businessDaysRemaining = remaining
        deadlineExpired = remaining <= 0 && c.status === 'AWAITING_RESPONSE'
      }

      return {
        id: c.id,
        plate,
        vehicleType,
        status: c.status,
        fotomultaCount: c.caseFotomultas.length,
        submissionDate: c.submissionDate?.toISOString() ?? null,
        deadlineDate: c.deadlineDate?.toISOString() ?? null,
        businessDaysRemaining,
        deadlineExpired,
        createdAt: c.createdAt.toISOString(),
      }
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json([])
  }
}
