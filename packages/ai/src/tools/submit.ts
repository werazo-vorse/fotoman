import { tool } from 'ai'
import {
  buildSubmissionBody,
  buildSubmissionSubject,
  sendPetition,
} from '@fotoman/core/email'
import { z } from 'zod'

export const submitPetitionTool = tool({
  description:
    'Envía el derecho de petición por correo electrónico a la autoridad de tránsito con copia al peticionario. SOLO usar después de que el usuario haya revisado y aprobado el documento, y SOLO después del pago. Requiere el PDF generado previamente como base64.',
  inputSchema: z.object({
    authorityEmail: z.string().describe('Correo de la autoridad de tránsito (ej: movilidad@cali.gov.co)'),
    petitionerEmail: z.string().describe('Correo del peticionario para recibir copia'),
    petitionerName: z.string().describe('Nombre completo del peticionario'),
    authority: z.string().describe('Nombre de la autoridad (ej: SECRETARÍA DE MOVILIDAD DE CALI)'),
    resolutionNumbers: z.array(z.string()).describe('Números de resolución impugnadas'),
    vehiclePlate: z.string().describe('Placa del vehículo'),
    pdfBase64: z.string().describe('PDF del derecho de petición codificado en base64'),
  }),
  execute: async ({
    authorityEmail,
    petitionerEmail,
    petitionerName,
    authority,
    resolutionNumbers,
    vehiclePlate,
    pdfBase64,
  }) => {
    const pdfBuffer = new Uint8Array(
      Buffer.from(pdfBase64, 'base64'),
    )

    const subject = buildSubmissionSubject(resolutionNumbers)
    const bodyText = buildSubmissionBody({
      petitionerName,
      authority,
      resolutionNumbers,
    })

    const result = await sendPetition({
      toEmail: authorityEmail,
      ccEmail: petitionerEmail,
      subject,
      bodyText,
      pdfBuffer,
      pdfFilename: `derecho-de-peticion-${vehiclePlate}.pdf`,
      petitionerName,
    })

    if (result.success) {
      return {
        submitted: true,
        messageId: result.messageId,
        message: `Petición enviada exitosamente a ${authorityEmail}. Copia enviada a ${petitionerEmail}. ID de seguimiento: ${result.messageId}`,
      }
    }

    return {
      submitted: false,
      error: result.error,
      message: `Error al enviar la petición: ${result.error}. Por favor intente de nuevo o envíe el documento manualmente.`,
    }
  },
})
