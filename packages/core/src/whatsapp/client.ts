import type {
  SendDocumentOptions,
  SendMessageOptions,
  WhatsAppMessage,
  WhatsAppWebhookBody,
} from './types.js'

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0'

function getConfig() {
  return {
    token: process.env['WHATSAPP_TOKEN'] ?? '',
    phoneNumberId: process.env['WHATSAPP_PHONE_NUMBER_ID'] ?? '',
    verifyToken: process.env['WHATSAPP_VERIFY_TOKEN'] ?? 'fotoman-verify',
  }
}

export function extractMessages(body: WhatsAppWebhookBody): WhatsAppMessage[] {
  const messages: WhatsAppMessage[] = []

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      if (!value.messages) continue

      const contacts = value.contacts ?? []

      for (const msg of value.messages) {
        if (msg.type !== 'text' || !msg.text?.body) continue

        const contact = contacts.find((c) => c.wa_id === msg.from)
        messages.push({
          from: msg.from,
          name: contact?.profile.name ?? msg.from,
          text: msg.text.body,
          messageId: msg.id,
          timestamp: msg.timestamp,
        })
      }
    }
  }

  return messages
}

export async function sendTextMessage(options: SendMessageOptions): Promise<boolean> {
  const config = getConfig()
  if (!config.token || !config.phoneNumberId) {
    console.log(`[MOCK WA] To: ${options.to}, Text: ${options.text.slice(0, 100)}...`)
    return true
  }

  try {
    const res = await fetch(
      `${GRAPH_API_URL}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: options.to,
          type: 'text',
          text: { body: options.text },
        }),
      },
    )
    return res.ok
  } catch {
    return false
  }
}

export async function sendDocument(options: SendDocumentOptions): Promise<boolean> {
  const config = getConfig()
  if (!config.token || !config.phoneNumberId) {
    console.log(`[MOCK WA] Document to: ${options.to}, File: ${options.filename}`)
    return true
  }

  try {
    // First upload the media
    const formData = new FormData()
    const bytes = Buffer.from(options.documentBase64, 'base64')
    const blob = new Blob([bytes], { type: 'application/pdf' })
    formData.append('file', blob, options.filename)
    formData.append('messaging_product', 'whatsapp')
    formData.append('type', 'application/pdf')

    const uploadRes = await fetch(
      `${GRAPH_API_URL}/${config.phoneNumberId}/media`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.token}` },
        body: formData,
      },
    )

    if (!uploadRes.ok) return false

    const { id: mediaId } = (await uploadRes.json()) as { id: string }

    // Then send the document message
    const res = await fetch(
      `${GRAPH_API_URL}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: options.to,
          type: 'document',
          document: {
            id: mediaId,
            caption: options.caption ?? options.filename,
            filename: options.filename,
          },
        }),
      },
    )
    return res.ok
  } catch {
    return false
  }
}

export function verifyWebhook(
  mode: string | null,
  token: string | null,
  challenge: string | null,
): { valid: boolean; challenge: string } {
  const config = getConfig()
  if (mode === 'subscribe' && token === config.verifyToken && challenge) {
    return { valid: true, challenge }
  }
  return { valid: false, challenge: '' }
}
