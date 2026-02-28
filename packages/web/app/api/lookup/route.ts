import { lookupFotomultas } from '@fotoman/core/simit'
import { businessDaysBetween } from '@fotoman/core/calendar'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { plate, cedula } = (await req.json()) as { plate: string; cedula?: string }

  if (!cedula || cedula.trim().length < 5) {
    return NextResponse.json({ error: 'Cedula invalida' }, { status: 400 })
  }

  const result = await lookupFotomultas(plate, cedula)

  if (!result) {
    return NextResponse.json({ found: false, plate: plate.toUpperCase() })
  }

  const fotomultasWithAnalysis = result.fotomultas.map((f) => {
    const defenses: string[] = []

    if (f.infractionDate && f.notificationDate) {
      const days = businessDaysBetween(
        new Date(f.infractionDate),
        new Date(f.notificationDate),
      )
      if (days > 13) {
        defenses.push('indebida-notificacion')
      }
    }

    if (!f.notificationDate) {
      defenses.push('indebida-notificacion')
    }

    defenses.push('conductor-no-identificado')

    if (f.infractionDate) {
      const daysSinceInfraction = Math.floor(
        (Date.now() - new Date(f.infractionDate).getTime()) / (1000 * 60 * 60 * 24),
      )
      if (daysSinceInfraction > 365 && !f.resolutionDate) {
        defenses.push('caducidad')
      }
    }

    if (f.resolutionDate) {
      const daysSinceResolution = Math.floor(
        (Date.now() - new Date(f.resolutionDate).getTime()) / (1000 * 60 * 60 * 24),
      )
      if (daysSinceResolution > 1095) {
        defenses.push('prescripcion')
      }
    }

    let notificationDays: number | null = null
    if (f.infractionDate && f.notificationDate) {
      notificationDays = businessDaysBetween(
        new Date(f.infractionDate),
        new Date(f.notificationDate),
      )
    }

    return {
      ...f,
      notificationBusinessDays: notificationDays,
      applicableDefenses: defenses,
    }
  })

  return NextResponse.json({
    found: true,
    plate: result.plate,
    ownerName: result.ownerName,
    vehicleType: result.vehicleType,
    vehicleBrand: result.vehicleBrand,
    fotomultas: fotomultasWithAnalysis,
    totalAmount: result.fotomultas.reduce((sum, f) => sum + f.amount, 0),
  })
}
