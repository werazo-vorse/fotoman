import { updateCaseStatus } from '@fotoman/db'
import type { DeadlineJobData } from './deadlines.js'

export async function processDeadlineJob(data: DeadlineJobData): Promise<void> {
  const { caseId, type } = data

  if (type === 'warning') {
    await updateCaseStatus(
      caseId,
      'AWAITING_RESPONSE',
      'DEADLINE_WARNING',
      'Faltan 3 días hábiles para que venza el plazo de respuesta.',
    )
  } else if (type === 'expiration') {
    await updateCaseStatus(
      caseId,
      'ESCALATED',
      'DEADLINE_EXPIRED',
      'El plazo de 15 días hábiles venció sin respuesta. Aplica silencio administrativo positivo.',
    )
  }
}
