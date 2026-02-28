import { tool } from 'ai'
import {
  getEffectiveness,
  recordCaseOutcome,
  updateCaseResultAnalysis,
} from '@fotoman/db'
import type { DefenseResultInput } from '@fotoman/db'
import { z } from 'zod'

export const analyzeResponseTool = tool({
  description:
    'Analiza la respuesta de la autoridad de tránsito a una impugnación. Extrae el resultado por cada defensa aplicada, las razones de rechazo y los contra-argumentos usados por la autoridad. Guarda el análisis en la base de datos.',
  inputSchema: z.object({
    caseId: z.string().describe('ID del caso'),
    overallOutcome: z
      .enum(['WON', 'LOST', 'PARTIAL'])
      .describe('Resultado general: WON si aceptaron la impugnación, LOST si la rechazaron, PARTIAL si aceptaron parcialmente'),
    authorityName: z.string().describe('Nombre de la autoridad que respondió'),
    defenseResults: z
      .array(
        z.object({
          defenseKey: z.string().describe('Clave de la defensa (ej: indebida-notificacion)'),
          effective: z.boolean().describe('Si esta defensa fue efectiva o no'),
          rejectionReason: z
            .string()
            .optional()
            .describe('Razón de rechazo en máximo una oración corta'),
          counterArgument: z
            .string()
            .optional()
            .describe('Contra-argumento exacto que usó la autoridad en máximo una oración'),
        }),
      )
      .describe('Resultado por cada defensa aplicada'),
    aiAnalysis: z
      .string()
      .describe('Resumen del análisis en 2-3 oraciones: qué pasó y por qué'),
    lessonsLearned: z
      .string()
      .describe('Qué hacer diferente la próxima vez, en 1-2 oraciones'),
  }),
  execute: async ({
    caseId,
    overallOutcome,
    authorityName,
    defenseResults,
    aiAnalysis,
    lessonsLearned,
  }) => {
    const dResults: DefenseResultInput[] = defenseResults.map((dr) => ({
      defenseKey: dr.defenseKey,
      effective: dr.effective,
      rejectionReason: dr.rejectionReason,
      counterArgument: dr.counterArgument,
    }))

    await recordCaseOutcome(
      {
        caseId,
        outcome: overallOutcome,
        authorityName,
        responseDate: new Date(),
      },
      dResults,
    )

    await updateCaseResultAnalysis(caseId, { aiAnalysis, lessonsLearned })

    return {
      recorded: true,
      caseId,
      outcome: overallOutcome,
      defensesAnalyzed: defenseResults.length,
      message: 'Análisis registrado exitosamente.',
    }
  },
})

export const queryEffectivenessTool = tool({
  description:
    'Consulta la efectividad histórica de las defensas contra una autoridad específica. Retorna tasas de éxito, razones de rechazo comunes y contra-argumentos conocidos. Usa esta información ANTES de generar documentos para fortalecer los argumentos.',
  inputSchema: z.object({
    defenseKeys: z
      .array(z.string())
      .describe('Claves de las defensas a consultar'),
    authorityName: z
      .string()
      .describe('Nombre de la autoridad (ej: SECRETARÍA DE MOVILIDAD DE CALI)'),
  }),
  execute: async ({ defenseKeys, authorityName }) => {
    const data = await getEffectiveness(defenseKeys, authorityName)

    if (data.length === 0) {
      return {
        found: false as const,
        message: 'No hay suficientes datos históricos aún (se requieren mínimo 5 casos por defensa).',
        defenses: [],
      }
    }

    return {
      found: true as const,
      defenses: data.map((d) => ({
        defenseKey: d.defenseKey,
        totalCases: d.totalCases,
        winRate: `${Math.round(d.winRate * 100)}%`,
        wins: d.wins,
        losses: d.losses,
        topRejections: d.topRejections,
        topCounterArgs: d.topCounterArgs,
      })),
      recommendation:
        'Prioriza las defensas con mayor tasa de éxito. Para las de menor tasa, refuerza la refutación anticipando los contra-argumentos listados.',
    }
  },
})
