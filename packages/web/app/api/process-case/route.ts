import { createGroq } from '@ai-sdk/groq'
import { getSystemPrompt } from '@fotoman/ai'
import { addBusinessDays } from '@fotoman/core/calendar'
import { sendPetition, buildSubmissionSubject, buildSubmissionBody } from '@fotoman/core/email'
import { createFullCase } from '@fotoman/db'
import { scheduleDeadlineCheck } from '@fotoman/jobs'
import {
  buildDefaultPeticiones,
  buildDefaultPruebas,
  buildDefaultRefutacion,
  buildFundamentos,
  generatePetitionPdf,
} from '@fotoman/pdf'
import { generateText, stepCountIs } from 'ai'
import { NextResponse } from 'next/server'

const groq = createGroq()

const AUTHORITY_EMAIL = process.env.NODE_ENV === 'production'
  ? 'movilidad@cali.gov.co'
  : (process.env['STAGING_AUTHORITY_EMAIL'] ?? 'movilidad@cali.gov.co')
const AUTHORITY_NAME = 'SECRETARIA DE MOVILIDAD DE SANTIAGO DE CALI'

export const maxDuration = 60

interface ProcessRequest {
  paymentReference: string
  selectedComparendos: string[]
  userData: {
    name: string
    cedula: string
    cedulaCity: string
    email: string
    phone: string
    address: string
    city: string
  }
  lookupData: {
    plate: string
    ownerName: string
    vehicleType: string
    vehicleBrand: string
    fotomultas: {
      comparendoNumber: string
      resolutionNumber: string | null
      infractionDate: string
      notificationDate: string | null
      infractionCode: string
      infractionDescription: string
      amount: number
      applicableDefenses: string[]
    }[]
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as ProcessRequest

  if (!body.paymentReference) {
    return NextResponse.json({ error: 'Pago no confirmado' }, { status: 402 })
  }

  const selectedFotomultas = body.lookupData.fotomultas.filter((f) =>
    body.selectedComparendos.includes(f.comparendoNumber),
  )

  if (selectedFotomultas.length === 0) {
    return NextResponse.json({ error: 'No se seleccionaron fotomultas' }, { status: 400 })
  }

  try {
    // 1. Generate hechos with AI
    const allDefenses = [...new Set(selectedFotomultas.flatMap((f) => f.applicableDefenses))]
    const fotomultaSummary = selectedFotomultas
      .map(
        (f) =>
          `- Comparendo ${f.comparendoNumber}, Resolucion ${f.resolutionNumber ?? 'sin resolucion'}, ` +
          `Fecha infraccion: ${f.infractionDate}, Codigo: ${f.infractionCode} (${f.infractionDescription}), ` +
          `Notificacion: ${f.notificationDate ?? 'sin notificacion'}, Defensas: ${f.applicableDefenses.join(', ')}`,
      )
      .join('\n')

    const hechosPrompt = `Redacta los HECHOS numerados para un derecho de peticion que impugna las siguientes fotomultas del vehiculo ${body.lookupData.vehicleType} ${body.lookupData.vehicleBrand} placa ${body.lookupData.plate}:

${fotomultaSummary}

Defensas aplicables: ${allDefenses.join(', ')}

Reglas:
- Español juridico colombiano formal
- Hechos numerados (PRIMERO, SEGUNDO, etc.)
- Incluye fechas exactas y numeros de resolucion/comparendo
- NO incluyas el numero de cedula
- Maximo 8 hechos
- Cada hecho debe ser un parrafo conciso

Responde SOLO con los hechos, uno por linea, separados por ||`

    const { text: hechosRaw } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: getSystemPrompt(),
      messages: [{ role: 'user', content: hechosPrompt }],
      stopWhen: stepCountIs(1),
    })

    const hechos = hechosRaw
      .split('||')
      .map((h) => h.trim())
      .filter(Boolean)

    // 2. Generate PDF
    const fotomultasForPdf = selectedFotomultas.map((f) => ({
      resolutionNumber: f.resolutionNumber ?? f.comparendoNumber,
      comparendoNumber: f.comparendoNumber,
      infractionDate: f.infractionDate,
      infractionCode: f.infractionCode,
    }))

    const today = new Date()
    const dateStr = today.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    const peticiones = buildDefaultPeticiones(fotomultasForPdf, allDefenses)
    const fundamentosDeDerecho = buildFundamentos(allDefenses)
    const refutacion = buildDefaultRefutacion(allDefenses)
    const pruebas = buildDefaultPruebas(fotomultasForPdf)

    const pdf = await generatePetitionPdf({
      city: body.userData.city,
      date: dateStr,
      authority: AUTHORITY_NAME,
      petitioner: {
        fullName: body.userData.name,
        cedula: body.userData.cedula,
        cedulaCity: body.userData.cedulaCity,
        email: body.userData.email,
        address: body.userData.address,
        phone: body.userData.phone,
      },
      vehicle: {
        plate: body.lookupData.plate,
        type: body.lookupData.vehicleType,
        brand: body.lookupData.vehicleBrand,
      },
      fotomultas: fotomultasForPdf,
      defenseKeys: allDefenses,
      hechos,
      peticiones,
      fundamentosDeDerecho,
      refutacion,
      pruebas,
    })

    // 3. Submit via email
    const resolutionNumbers = fotomultasForPdf.map((f) => f.resolutionNumber)
    const subject = buildSubmissionSubject(resolutionNumbers, allDefenses)
    const emailBody = buildSubmissionBody({
      petitionerName: body.userData.name,
      authority: AUTHORITY_NAME,
      resolutionNumbers,
    })

    const ccEmail = process.env.NODE_ENV === 'production'
      ? body.userData.email
      : (process.env['STAGING_AUTHORITY_EMAIL'] ?? body.userData.email)

    const emailResult = await sendPetition({
      toEmail: AUTHORITY_EMAIL,
      ccEmail,
      subject,
      bodyText: emailBody,
      pdfBuffer: new Uint8Array(pdf),
      pdfFilename: `derecho-de-peticion-${body.lookupData.plate}.pdf`,
      petitionerName: body.userData.name,
    })

    const deadlineDate = addBusinessDays(today, 15)
    const submissionProof = JSON.stringify({
      messageId: emailResult.messageId ?? 'N/A',
      sentTo: AUTHORITY_EMAIL,
      sentAt: today.toISOString(),
    })

    // 4. Persist to database
    const newCase = await createFullCase({
      userData: {
        name: body.userData.name,
        cedula: body.userData.cedula,
        email: body.userData.email,
        phone: body.userData.phone,
        address: body.userData.address,
      },
      vehicle: {
        plate: body.lookupData.plate,
        type: body.lookupData.vehicleType,
        brand: body.lookupData.vehicleBrand,
      },
      fotomultas: selectedFotomultas.map((f) => ({
        comparendoNumber: f.comparendoNumber,
        resolutionNumber: f.resolutionNumber,
        infractionDate: f.infractionDate,
        notificationDate: f.notificationDate,
        infractionCode: f.infractionCode,
        infractionDescription: f.infractionDescription,
        amount: f.amount,
      })),
      defensesApplied: allDefenses,
      pdf: new Uint8Array(pdf),
      paymentReference: body.paymentReference,
      authorityEmail: AUTHORITY_EMAIL,
      submissionProof,
      submissionMessageId: emailResult.messageId ?? undefined,
      submissionDate: today,
      deadlineDate,
    })

    // 5. Schedule deadline tracking jobs
    try {
      await scheduleDeadlineCheck(newCase.id, today)
    } catch (err) {
      console.error('Failed to schedule deadline jobs (Redis may be down):', err)
    }

    const pdfBase64 = Buffer.from(pdf).toString('base64')

    return NextResponse.json({
      success: true,
      caseId: newCase.id,
      submissionProof: {
        messageId: emailResult.messageId ?? 'N/A',
        sentTo: AUTHORITY_EMAIL,
        sentAt: today.toISOString(),
      },
      pdfDownloadUrl: `data:application/pdf;base64,${pdfBase64}`,
      deadlineDate: deadlineDate.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    })
  } catch (err) {
    console.error('Process case error:', err)
    const message = err instanceof Error ? err.message : 'Error procesando el caso'
    return NextResponse.json({ error: message, success: false }, { status: 500 })
  }
}
