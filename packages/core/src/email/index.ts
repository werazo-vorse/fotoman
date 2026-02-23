import type { SubmissionInput, SubmissionResult } from './types.js'

export type { SubmissionInput, SubmissionResult }

const SYSTEM_FROM_EMAIL = 'peticiones@fotoman.co'
const SYSTEM_FROM_NAME = 'Fotoman - Defensa Legal'

async function sendViaResend(input: SubmissionInput): Promise<SubmissionResult> {
  const apiKey = process.env['RESEND_API_KEY']
  if (!apiKey) {
    return sendMock(input)
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const pdfBase64 = Buffer.from(input.pdfBuffer).toString('base64')

    const { data, error } = await resend.emails.send({
      from: `${SYSTEM_FROM_NAME} <${SYSTEM_FROM_EMAIL}>`,
      to: [input.toEmail],
      cc: [input.ccEmail],
      subject: input.subject,
      text: input.bodyText,
      attachments: [
        {
          filename: input.pdfFilename,
          content: pdfBase64,
          contentType: 'application/pdf',
        },
      ],
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error'
    return { success: false, error: message }
  }
}

function sendMock(input: SubmissionInput): Promise<SubmissionResult> {
  const mockId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  console.log(
    `[MOCK EMAIL] To: ${input.toEmail}, CC: ${input.ccEmail}, Subject: ${input.subject}, PDF: ${input.pdfFilename} (${input.pdfBuffer.length} bytes)`,
  )
  return Promise.resolve({ success: true, messageId: mockId })
}

export async function sendPetition(input: SubmissionInput): Promise<SubmissionResult> {
  if (!input.toEmail || !input.ccEmail) {
    return { success: false, error: 'Email addresses are required' }
  }
  return sendViaResend(input)
}

export function buildSubmissionSubject(resolutionNumbers: string[]): string {
  const nums = resolutionNumbers.map((n) => `No. ${n}`).join(' y ')
  return `Impugnación Resoluciones ${nums} - Derecho de Petición`
}

export function buildSubmissionBody(input: {
  petitionerName: string
  authority: string
  resolutionNumbers: string[]
}): string {
  const nums = input.resolutionNumbers.map((n) => `No. ${n}`).join(' y ')
  return `Señores ${input.authority},
E. S. D.

Por medio del presente correo, ${input.petitionerName} interpone formal derecho de petición en relación con las Resoluciones ${nums}.

Se adjunta el documento completo con los fundamentos de hecho y de derecho correspondientes.

Solicito acuse de recibo del presente correo y respuesta de fondo dentro de los términos legales establecidos en la Ley 1755 de 2015.

Atentamente,

${input.petitionerName}
(Enviado a través de Fotoman - Defensa Legal contra Fotomultas)`
}
