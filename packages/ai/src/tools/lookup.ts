import { tool } from 'ai'
import { lookupFotomultas } from '@fotoman/core/simit'
import { z } from 'zod'

export const lookupFotomultasTool = tool({
  description:
    'Consulta el SIMIT para obtener las fotomultas activas de un vehículo por número de placa. Retorna datos del propietario, vehículo, y lista de fotomultas con fechas, montos y estado.',
  inputSchema: z.object({
    plate: z.string().describe('Número de placa del vehículo (ej: BYF83F)'),
  }),
  execute: async ({ plate }) => {
    const result = await lookupFotomultas(plate)
    if (!result) {
      return { found: false as const, plate, message: 'No se encontraron registros para esta placa.' }
    }
    return {
      found: true as const,
      plate: result.plate,
      ownerName: result.ownerName,
      vehicleType: result.vehicleType,
      vehicleBrand: result.vehicleBrand,
      fotomultaCount: result.fotomultas.length,
      fotomultas: result.fotomultas.map((f) => ({
        comparendoNumber: f.comparendoNumber,
        resolutionNumber: f.resolutionNumber,
        infractionDate: f.infractionDate,
        notificationDate: f.notificationDate,
        resolutionDate: f.resolutionDate,
        infractionCode: f.infractionCode,
        infractionDescription: f.infractionDescription,
        amount: f.amount,
        status: f.status,
        cameraLocation: f.cameraLocation,
      })),
    }
  },
})
