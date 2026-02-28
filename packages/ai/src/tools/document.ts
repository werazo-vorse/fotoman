import { tool } from 'ai'
import {
  buildDefaultPeticiones,
  buildDefaultPruebas,
  buildDefaultRefutacion,
  buildFundamentos,
  generatePetitionPdf,
} from '@fotoman/pdf'
import { z } from 'zod'

export const generateDocumentTool = tool({
  description:
    'Genera el documento legal (derecho de petición) en PDF para impugnar fotomultas. Requiere los datos del peticionario, las fotomultas a impugnar, los hechos personalizados del caso (escritos por ti), y las estrategias de defensa seleccionadas. Retorna el PDF codificado en base64.',
  inputSchema: z.object({
    city: z.string().describe('Ciudad (ej: Cali)'),
    date: z.string().describe('Fecha del documento en formato DD/MM/YYYY'),
    authority: z.string().describe('Autoridad destinataria (ej: SECRETARÍA DE MOVILIDAD DE CALI)'),
    petitionerFullName: z.string().describe('Nombre completo del peticionario'),
    petitionerCedula: z.string().describe('Número de cédula'),
    petitionerCedulaCity: z.string().describe('Ciudad de expedición de la cédula'),
    petitionerEmail: z.string().describe('Correo electrónico del peticionario'),
    petitionerAddress: z.string().describe('Dirección física'),
    petitionerPhone: z.string().describe('Teléfono de contacto'),
    vehiclePlate: z.string().describe('Placa del vehículo'),
    vehicleType: z.string().describe('Tipo de vehículo (ej: Motocicleta, Automóvil)'),
    vehicleBrand: z.string().describe('Marca del vehículo'),
    fotomultas: z
      .array(
        z.object({
          resolutionNumber: z.string(),
          comparendoNumber: z.string(),
          infractionDate: z.string(),
          infractionCode: z.string(),
        }),
      )
      .describe('Lista de fotomultas a impugnar'),
    hechos: z
      .array(z.string())
      .describe('Lista de hechos del caso (cada uno será un párrafo numerado). Escríbelos en español formal.'),
    defenseKeys: z
      .array(z.string())
      .describe('Claves de las estrategias de defensa aplicables (ej: indebida-notificacion, conductor-no-identificado)'),
  }),
  execute: async ({
    city,
    date,
    authority,
    petitionerFullName,
    petitionerCedula,
    petitionerCedulaCity,
    petitionerEmail,
    petitionerAddress,
    petitionerPhone,
    vehiclePlate,
    vehicleType,
    vehicleBrand,
    fotomultas,
    hechos,
    defenseKeys,
  }) => {
    const peticiones = buildDefaultPeticiones(fotomultas, defenseKeys)
    const fundamentosDeDerecho = buildFundamentos(defenseKeys)
    const refutacion = buildDefaultRefutacion(defenseKeys)
    const pruebas = buildDefaultPruebas(fotomultas)

    const pdf = await generatePetitionPdf({
      city,
      date,
      authority,
      petitioner: {
        fullName: petitionerFullName,
        cedula: petitionerCedula,
        cedulaCity: petitionerCedulaCity,
        email: petitionerEmail,
        address: petitionerAddress,
        phone: petitionerPhone,
      },
      vehicle: {
        plate: vehiclePlate,
        type: vehicleType,
        brand: vehicleBrand,
      },
      fotomultas,
      hechos,
      peticiones,
      fundamentosDeDerecho,
      refutacion,
      pruebas,
    })

    const base64 = Buffer.from(pdf).toString('base64')

    return {
      generated: true,
      pages: Math.ceil(pdf.length / 3000),
      sizeBytes: pdf.length,
      base64Pdf: base64,
      message: 'Documento generado exitosamente. El PDF está listo para revisión.',
    }
  },
})
