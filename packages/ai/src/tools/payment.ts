import { tool } from 'ai'
import {
  FOTOMULTA_FEE_COP_CENTS,
  createPaymentLink,
  formatAmountCOP,
} from '@fotoman/core/payments'
import { z } from 'zod'

export const createPaymentTool = tool({
  description:
    'Crea un enlace de pago de Wompi para que el usuario pague por el servicio de impugnacion. El pago es requisito OBLIGATORIO antes de enviar la peticion. Devuelve una URL de pago.',
  inputSchema: z.object({
    caseId: z.string().describe('ID del caso'),
    fotomultaCount: z.number().describe('Cantidad de fotomultas a impugnar'),
    customerEmail: z.string().describe('Correo electronico del peticionario'),
    vehiclePlate: z.string().describe('Placa del vehiculo'),
  }),
  execute: async ({ caseId, fotomultaCount, customerEmail, vehiclePlate }) => {
    const amountInCents = FOTOMULTA_FEE_COP_CENTS * fotomultaCount
    const description = `Impugnacion ${fotomultaCount} fotomulta(s) - ${vehiclePlate}`

    try {
      const link = await createPaymentLink({
        caseId,
        amountInCents,
        description,
        customerEmail,
      })

      return {
        paymentUrl: link.url,
        reference: link.reference,
        amount: formatAmountCOP(amountInCents),
        amountInCents,
        message: `Enlace de pago generado: ${formatAmountCOP(amountInCents)} por ${fotomultaCount} fotomulta(s). El usuario debe pagar antes de poder enviar la peticion.`,
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error creating payment'
      return {
        paymentUrl: null,
        error,
        message: `Error al crear el enlace de pago: ${error}`,
      }
    }
  },
})
