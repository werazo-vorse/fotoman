import { type NextRequest, NextResponse } from 'next/server'
import {
  prisma,
  recordCaseOutcome,
  findCaseByMessageId,
  findCaseByResolutionNumber,
} from '@fotoman/db'

interface ResendInboundEvent {
  type: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    message_id: string
    headers?: Array<{ name: string; value: string }>
    attachments?: Array<{
      id: string
      filename: string
      content_type: string
    }>
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env['RESEND_WEBHOOK_SECRET']
  if (secret) {
    const svixId = request.headers.get('svix-id')
    const svixTimestamp = request.headers.get('svix-timestamp')
    const svixSignature = request.headers.get('svix-signature')
    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: 'Missing webhook headers' }, { status: 401 })
    }
  }

  const event = (await request.json()) as ResendInboundEvent

  if (event.type !== 'email.received') {
    return NextResponse.json({ ignored: true })
  }

  const { data } = event

  const caseId = await matchToCase(data)
  if (!caseId) {
    console.log('[WEBHOOK] No matching case for inbound email:', data.subject)
    return NextResponse.json({ matched: false })
  }

  let bodyText: string | undefined
  let pdfBytes: Uint8Array | undefined

  const apiKey = process.env['RESEND_API_KEY']
  if (apiKey) {
    try {
      const emailRes = await fetch(`https://api.resend.com/emails/${data.email_id}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (emailRes.ok) {
        const emailData = (await emailRes.json()) as { text?: string; html?: string }
        bodyText = emailData.text ?? emailData.html
      }
    } catch (err) {
      console.error('[WEBHOOK] Failed to fetch email body:', err)
    }

    if (data.attachments?.length) {
      const pdfAttachment = data.attachments.find(
        (a) => a.content_type === 'application/pdf',
      )
      if (pdfAttachment) {
        try {
          const attRes = await fetch(
            `https://api.resend.com/emails/${data.email_id}/attachments/${pdfAttachment.id}`,
            { headers: { Authorization: `Bearer ${apiKey}` } },
          )
          if (attRes.ok) {
            pdfBytes = new Uint8Array(await attRes.arrayBuffer())
          }
        } catch (err) {
          console.error('[WEBHOOK] Failed to fetch attachment:', err)
        }
      }
    }
  }

  const theCase = await prisma.case.findUnique({
    where: { id: caseId },
    select: { authorityEmail: true, defensesApplied: true },
  })

  await recordCaseOutcome({
    caseId,
    outcome: 'PENDING',
    authorityName: extractAuthorityName(data.from),
    responseDate: new Date(),
    responseText: bodyText,
    responsePdf: pdfBytes,
    inboundEmailId: data.email_id,
  })

  await prisma.case.update({
    where: { id: caseId },
    data: { status: 'RESPONDED' },
  })

  await prisma.caseEvent.create({
    data: {
      caseId,
      type: 'RESPONSE_RECEIVED',
      details: `Respuesta recibida de ${data.from}. Asunto: ${data.subject}`,
    },
  })

  console.log(`[WEBHOOK] Response received for case ${caseId}`)

  return NextResponse.json({ matched: true, caseId })
}

async function matchToCase(data: ResendInboundEvent['data']): Promise<string | null> {
  const inReplyTo = data.headers?.find(
    (h) => h.name.toLowerCase() === 'in-reply-to',
  )?.value
  if (inReplyTo) {
    const caseId = await findCaseByMessageId(inReplyTo.replace(/[<>]/g, ''))
    if (caseId) return caseId
  }

  const references = data.headers?.find(
    (h) => h.name.toLowerCase() === 'references',
  )?.value
  if (references) {
    for (const ref of references.split(/\s+/)) {
      const caseId = await findCaseByMessageId(ref.replace(/[<>]/g, ''))
      if (caseId) return caseId
    }
  }

  const resMatch = data.subject?.match(/(?:No\.\s*)?(\d{7,})/g)
  if (resMatch) {
    for (const num of resMatch) {
      const clean = num.replace(/^No\.\s*/, '')
      const caseId = await findCaseByResolutionNumber(clean)
      if (caseId) return caseId
    }
  }

  return null
}

function extractAuthorityName(from: string): string {
  const nameMatch = from.match(/^(.+?)\s*</)
  return nameMatch ? nameMatch[1]!.trim() : from.split('@')[0] ?? 'unknown'
}
