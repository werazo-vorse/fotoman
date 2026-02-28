import { tool } from 'ai'
import {
  getAllStrategies,
  getDefenseStrategy,
  getLegalReference,
  validateCitation,
} from '@fotoman/core/legal-kb'
import type { DefenseKey } from '@fotoman/core/legal-kb'
import { z } from 'zod'

export const getLegalReferenceTool = tool({
  description:
    'Obtiene el texto completo de una referencia legal colombiana por su clave. Úsala para fundamentar argumentos con el texto exacto de la ley o sentencia.',
  inputSchema: z.object({
    key: z
      .string()
      .describe(
        'Clave de la referencia legal (ej: ley-1843-2017-art8, sentencia-c038-2020, constitucion-art29)',
      ),
  }),
  execute: async ({ key }) => {
    const ref = getLegalReference(key)
    if (!ref) {
      return { found: false as const, key, message: 'Referencia legal no encontrada.' }
    }
    return {
      found: true as const,
      key: ref.key,
      citation: ref.citation,
      shortName: ref.shortName,
      summary: ref.summary,
      fullText: ref.fullText,
    }
  },
})

export const getDefenseStrategyTool = tool({
  description:
    'Obtiene la definición completa de una estrategia de defensa contra fotomultas, incluyendo cuándo aplica y qué referencias legales la sustentan.',
  inputSchema: z.object({
    key: z
      .enum([
        'indebida-notificacion',
        'conductor-no-identificado',
        'caducidad',
        'prescripcion',
        'vicios-tecnicos',
      ] as const)
      .describe('Clave de la estrategia de defensa'),
  }),
  execute: async ({ key }) => {
    const strategy = getDefenseStrategy(key as DefenseKey)
    if (!strategy) {
      return { found: false as const, key, message: 'Estrategia no encontrada.' }
    }
    return {
      found: true as const,
      key: strategy.key,
      name: strategy.name,
      description: strategy.description,
      applicableWhen: strategy.applicableWhen,
      requiredRefs: strategy.requiredRefs,
    }
  },
})

export const listAllDefensesTool = tool({
  description:
    'Lista todas las estrategias de defensa disponibles contra fotomultas con sus claves y descripciones. No requiere parámetros.',
  inputSchema: z.object({
    _unused: z.string().optional().describe('No se usa. Enviar cadena vacía o no incluir.'),
  }),
  execute: async () => {
    const strategies = getAllStrategies()
    return {
      strategies: strategies.map((s) => ({
        key: s.key,
        name: s.name,
        description: s.description,
        applicableWhen: s.applicableWhen,
      })),
    }
  },
})

export const validateCitationTool = tool({
  description:
    'Valida si una cita legal (ley, sentencia, artículo) existe en la base de conocimiento legal. Usa esto para verificar que las citas que produces son correctas.',
  inputSchema: z.object({
    citation: z.string().describe('Texto de la cita legal a validar (ej: "Ley 1843 de 2017")'),
  }),
  execute: async ({ citation }) => {
    const ref = validateCitation(citation)
    if (!ref) {
      return {
        valid: false as const,
        citation,
        message: 'Esta cita no fue encontrada en la base de conocimiento legal.',
      }
    }
    return {
      valid: true as const,
      citation,
      matchedKey: ref.key,
      officialCitation: ref.citation,
    }
  },
})
