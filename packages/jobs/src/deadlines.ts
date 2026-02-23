import { addBusinessDays } from '@fotoman/core/calendar'
import { Queue } from 'bullmq'

const RESPONSE_DEADLINE_DAYS = 15
const WARNING_DAYS_BEFORE = 3
const QUEUE_NAME = 'deadline-checks'

export interface DeadlineJobData {
  caseId: string
  submissionDate: string
  type: 'warning' | 'expiration'
}

let queue: Queue<DeadlineJobData> | null = null

function getQueue(): Queue<DeadlineJobData> {
  if (!queue) {
    const redisUrl = process.env['REDIS_URL'] ?? 'redis://localhost:6379'
    const url = new URL(redisUrl)
    queue = new Queue<DeadlineJobData>(QUEUE_NAME, {
      connection: {
        host: url.hostname,
        port: Number(url.port) || 6379,
      },
    })
  }
  return queue
}

export function calculateDeadlineDate(submissionDate: Date): Date {
  return addBusinessDays(submissionDate, RESPONSE_DEADLINE_DAYS)
}

export function calculateWarningDate(submissionDate: Date): Date {
  return addBusinessDays(submissionDate, RESPONSE_DEADLINE_DAYS - WARNING_DAYS_BEFORE)
}

export async function scheduleDeadlineCheck(
  caseId: string,
  submissionDate: Date,
): Promise<{ warningJobId: string; expirationJobId: string }> {
  const q = getQueue()

  const warningDate = calculateWarningDate(submissionDate)
  const deadlineDate = calculateDeadlineDate(submissionDate)

  const now = new Date()
  const warningDelay = Math.max(0, warningDate.getTime() - now.getTime())
  const expirationDelay = Math.max(0, deadlineDate.getTime() - now.getTime())

  const warningJob = await q.add(
    'deadline-warning',
    {
      caseId,
      submissionDate: submissionDate.toISOString(),
      type: 'warning',
    },
    {
      delay: warningDelay,
      jobId: `warning-${caseId}`,
      removeOnComplete: true,
    },
  )

  const expirationJob = await q.add(
    'deadline-expiration',
    {
      caseId,
      submissionDate: submissionDate.toISOString(),
      type: 'expiration',
    },
    {
      delay: expirationDelay,
      jobId: `expiration-${caseId}`,
      removeOnComplete: true,
    },
  )

  return {
    warningJobId: warningJob.id ?? `warning-${caseId}`,
    expirationJobId: expirationJob.id ?? `expiration-${caseId}`,
  }
}

export async function closeQueue(): Promise<void> {
  if (queue) {
    await queue.close()
    queue = null
  }
}

export { QUEUE_NAME }
