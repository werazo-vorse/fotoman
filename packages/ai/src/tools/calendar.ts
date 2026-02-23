import { tool } from 'ai'
import { addBusinessDays, businessDaysBetween, isBusinessDay } from '@fotoman/core/calendar'
import { z } from 'zod'

function parseDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year!, month! - 1, day!))
}

function formatDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const calculateBusinessDaysTool = tool({
  description:
    'Calcula el número de días hábiles entre dos fechas en Colombia (excluyendo fines de semana y festivos colombianos). Exclusivo de la fecha inicio, inclusivo de la fecha fin. Útil para verificar si se cumplió el plazo de 13 días hábiles para notificación.',
  inputSchema: z.object({
    from: z
      .string()
      .describe('Fecha inicio en formato YYYY-MM-DD (ej: fecha de infracción)'),
    to: z
      .string()
      .describe('Fecha fin en formato YYYY-MM-DD (ej: fecha de notificación)'),
  }),
  execute: async ({ from, to }) => {
    const fromDate = parseDate(from)
    const toDate = parseDate(to)
    const days = businessDaysBetween(fromDate, toDate)
    return {
      from,
      to,
      businessDays: days,
      exceeds13Days: days > 13,
    }
  },
})

export const addBusinessDaysTool = tool({
  description:
    'Suma (o resta) días hábiles a una fecha en Colombia. Útil para calcular plazos legales como el vencimiento de 15 días hábiles para respuesta.',
  inputSchema: z.object({
    from: z.string().describe('Fecha inicio en formato YYYY-MM-DD'),
    days: z.number().describe('Número de días hábiles a sumar (negativo para restar)'),
  }),
  execute: async ({ from, days }) => {
    const result = addBusinessDays(parseDate(from), days)
    return {
      from,
      daysAdded: days,
      resultDate: formatDate(result),
    }
  },
})

export const isBusinessDayTool = tool({
  description: 'Verifica si una fecha es día hábil en Colombia (no es fin de semana ni festivo).',
  inputSchema: z.object({
    date: z.string().describe('Fecha en formato YYYY-MM-DD'),
  }),
  execute: async ({ date }) => {
    const result = isBusinessDay(parseDate(date))
    return { date, isBusinessDay: result }
  },
})
