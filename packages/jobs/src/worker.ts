import { Worker } from 'bullmq'
import type { DeadlineJobData } from './deadlines.js'
import { QUEUE_NAME } from './deadlines.js'
import { processDeadlineJob } from './processor.js'

const redisUrl = process.env['REDIS_URL'] ?? 'redis://localhost:6379'
const url = new URL(redisUrl)

const worker = new Worker<DeadlineJobData>(
  QUEUE_NAME,
  async (job) => {
    console.log(`Processing ${job.name} for case ${job.data.caseId}`)
    await processDeadlineJob(job.data)
    console.log(`Completed ${job.name} for case ${job.data.caseId}`)
  },
  {
    connection: {
      host: url.hostname,
      port: Number(url.port) || 6379,
    },
  },
)

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message)
})

worker.on('ready', () => {
  console.log('Deadline worker ready')
})

process.on('SIGTERM', async () => {
  await worker.close()
  process.exit(0)
})
