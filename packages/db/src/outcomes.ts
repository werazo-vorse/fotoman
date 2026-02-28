import { PrismaClient, type CaseOutcome } from '@prisma/client'

const prisma = new PrismaClient()

export interface RecordOutcomeInput {
  caseId: string
  outcome: CaseOutcome
  authorityName: string
  responseDate?: Date
  responseText?: string
  responsePdf?: Uint8Array
  inboundEmailId?: string
}

export interface DefenseResultInput {
  defenseKey: string
  effective: boolean
  rejectionReason?: string
  counterArgument?: string
}

export interface EffectivenessData {
  defenseKey: string
  authorityName: string
  totalCases: number
  wins: number
  losses: number
  winRate: number
  topRejections: string[]
  topCounterArgs: string[]
}

export async function recordCaseOutcome(
  input: RecordOutcomeInput,
  defenseResults: DefenseResultInput[] = [],
): Promise<string> {
  const result = await prisma.$transaction(async (tx) => {
    const caseResult = await tx.caseResult.upsert({
      where: { caseId: input.caseId },
      create: {
        caseId: input.caseId,
        outcome: input.outcome,
        authorityName: input.authorityName,
        responseDate: input.responseDate,
        responseText: input.responseText,
        responsePdf: input.responsePdf ? Buffer.from(input.responsePdf) : undefined,
        inboundEmailId: input.inboundEmailId,
      },
      update: {
        outcome: input.outcome,
        responseDate: input.responseDate,
        responseText: input.responseText,
        responsePdf: input.responsePdf ? Buffer.from(input.responsePdf) : undefined,
        inboundEmailId: input.inboundEmailId,
      },
    })

    if (defenseResults.length > 0) {
      for (const dr of defenseResults) {
        await tx.defenseResult.upsert({
          where: {
            caseResultId_defenseKey: {
              caseResultId: caseResult.id,
              defenseKey: dr.defenseKey,
            },
          },
          create: {
            caseResultId: caseResult.id,
            defenseKey: dr.defenseKey,
            effective: dr.effective,
            rejectionReason: dr.rejectionReason,
            counterArgument: dr.counterArgument,
          },
          update: {
            effective: dr.effective,
            rejectionReason: dr.rejectionReason,
            counterArgument: dr.counterArgument,
          },
        })
      }
    }

    return caseResult
  })

  return result.id
}

export async function updateCaseResultAnalysis(
  caseId: string,
  analysis: { aiAnalysis: string; lessonsLearned: string },
): Promise<void> {
  await prisma.caseResult.update({
    where: { caseId },
    data: analysis,
  })
}

const MIN_CASES_FOR_EFFECTIVENESS = 5

export async function getEffectiveness(
  defenseKeys: string[],
  authorityName: string,
): Promise<EffectivenessData[]> {
  const rows = await prisma.defenseEffectiveness.findMany({
    where: {
      defenseKey: { in: defenseKeys },
      authorityName,
      totalCases: { gte: MIN_CASES_FOR_EFFECTIVENESS },
    },
  })

  return rows.map((r) => ({
    defenseKey: r.defenseKey,
    authorityName: r.authorityName,
    totalCases: r.totalCases,
    wins: r.wins,
    losses: r.losses,
    winRate: r.winRate,
    topRejections: r.topRejections,
    topCounterArgs: r.topCounterArgs,
  }))
}

export async function recomputeEffectiveness(): Promise<number> {
  const grouped: Record<string, {
    wins: number
    losses: number
    total: number
    rejections: Record<string, number>
    counterArgs: Record<string, number>
  }> = {}

  const allResults = await prisma.defenseResult.findMany({
    include: { caseResult: { select: { authorityName: true, outcome: true } } },
  })

  for (const dr of allResults) {
    if (dr.caseResult.outcome === 'PENDING') continue
    const key = `${dr.defenseKey}::${dr.caseResult.authorityName}`

    if (!grouped[key]) {
      grouped[key] = { wins: 0, losses: 0, total: 0, rejections: {}, counterArgs: {} }
    }

    const g = grouped[key]!
    g.total++
    if (dr.effective) g.wins++
    else g.losses++

    if (dr.rejectionReason) {
      g.rejections[dr.rejectionReason] = (g.rejections[dr.rejectionReason] ?? 0) + 1
    }
    if (dr.counterArgument) {
      g.counterArgs[dr.counterArgument] = (g.counterArgs[dr.counterArgument] ?? 0) + 1
    }
  }

  let upserted = 0
  for (const [key, g] of Object.entries(grouped)) {
    const [defenseKey, authorityName] = key.split('::') as [string, string]
    const topRejections = topN(g.rejections, 3)
    const topCounterArgs = topN(g.counterArgs, 3)

    await prisma.defenseEffectiveness.upsert({
      where: { defenseKey_authorityName: { defenseKey, authorityName } },
      create: {
        defenseKey,
        authorityName,
        totalCases: g.total,
        wins: g.wins,
        losses: g.losses,
        winRate: g.total > 0 ? g.wins / g.total : 0,
        topRejections,
        topCounterArgs,
      },
      update: {
        totalCases: g.total,
        wins: g.wins,
        losses: g.losses,
        winRate: g.total > 0 ? g.wins / g.total : 0,
        topRejections,
        topCounterArgs,
      },
    })
    upserted++
  }

  return upserted
}

function topN(counts: Record<string, number>, n: number): string[] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k)
}

export async function getPendingExpiredCases(): Promise<Array<{
  id: string
  submissionDate: Date
  deadlineDate: Date
  authorityEmail: string | null
  defensesApplied: string[]
}>> {
  const now = new Date()
  return prisma.case.findMany({
    where: {
      status: { in: ['SUBMITTED', 'AWAITING_RESPONSE'] },
      deadlineDate: { lt: now },
      result: null,
    },
    select: {
      id: true,
      submissionDate: true,
      deadlineDate: true,
      authorityEmail: true,
      defensesApplied: true,
    },
  }) as Promise<Array<{
    id: string
    submissionDate: Date
    deadlineDate: Date
    authorityEmail: string | null
    defensesApplied: string[]
  }>>
}

export async function findCaseByMessageId(messageId: string): Promise<string | null> {
  const c = await prisma.case.findFirst({
    where: { submissionMessageId: messageId },
    select: { id: true },
  })
  return c?.id ?? null
}

export async function findCaseByResolutionNumber(resolutionNumber: string): Promise<string | null> {
  const cf = await prisma.caseFotomulta.findFirst({
    where: { fotomulta: { resolutionNumber } },
    select: { caseId: true },
  })
  return cf?.caseId ?? null
}
