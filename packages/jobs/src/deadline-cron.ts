import { Queue, Worker, type Job } from 'bullmq'
import { getPendingExpiredCases, recordCaseOutcome } from '@fotoman/db'
import { prisma } from '@fotoman/db'
const QUEUE_NAME = 'deadline-cron'

let queue: Queue | null = null

function getRedisConnection() {
  const redisUrl = process.env['REDIS_URL'] ?? 'redis://localhost:6379'
  const url = new URL(redisUrl)
  return {
    host: url.hostname,
    port: Number(url.port) || 6379,
    password: url.password || undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
  }
}

function getQueue(): Queue {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, { connection: getRedisConnection() })
  }
  return queue
}

export async function processExpiredDeadlines(): Promise<number> {
  const expired = await getPendingExpiredCases()
  let processed = 0

  for (const c of expired) {
    const authorityName = c.authorityEmail?.split('@')[1] ?? 'SECRETARÍA DE MOVILIDAD DE CALI'

    await recordCaseOutcome({
      caseId: c.id,
      outcome: 'NO_RESPONSE',
      authorityName,
      responseDate: c.deadlineDate,
    })

    await prisma.case.update({
      where: { id: c.id },
      data: { status: 'DEADLINE_EXPIRED' },
    })

    await prisma.caseEvent.create({
      data: {
        caseId: c.id,
        type: 'DEADLINE_EXPIRED',
        details: 'La autoridad no respondió dentro de los 15 días hábiles. Puede interponer acción de tutela.',
      },
    })

    processed++
    console.log(`[DEADLINE-CRON] Case ${c.id} marked as NO_RESPONSE`)
  }

  return processed
}

export async function scheduleDeadlineCron(): Promise<string> {
  const q = getQueue()

  await q.add(
    'check-deadlines',
    {},
    {
      repeat: { pattern: '0 8 * * *' },
      jobId: 'daily-deadline-check',
    },
  )

  return 'daily-deadline-check'
}

export function createDeadlineCronWorker(): Worker {
  const worker = new Worker(
    QUEUE_NAME,
    async (_job: Job) => {
      const count = await processExpiredDeadlines()
      console.log(`[DEADLINE-CRON] Processed ${count} expired cases`)
      return { processed: count }
    },
    { connection: getRedisConnection() },
  )

  worker.on('failed', (job, err) => {
    console.error(`[DEADLINE-CRON] Job ${job?.id} failed:`, err.message)
  })

  return worker
}

export async function closeDeadlineCronQueue(): Promise<void> {
  if (queue) {
    await queue.close()
    queue = null
  }
}
