import { describe, expect, it } from 'vitest'
import { extractMessages, sendTextMessage, verifyWebhook } from './index.js'
import type { WhatsAppWebhookBody } from './types.js'

const SAMPLE_WEBHOOK: WhatsAppWebhookBody = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '123456789',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '573001234567',
              phone_number_id: 'PHONE_ID',
            },
            contacts: [
              {
                profile: { name: 'Diana Zuñiga' },
                wa_id: '573044666312',
              },
            ],
            messages: [
              {
                from: '573044666312',
                id: 'wamid.abc123',
                timestamp: '1708704000',
                type: 'text',
                text: { body: 'Mi placa es BYF83F' },
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
}

describe('extractMessages', () => {
  it('extracts text messages from webhook body', () => {
    const messages = extractMessages(SAMPLE_WEBHOOK)
    expect(messages).toHaveLength(1)
    expect(messages[0]!.from).toBe('573044666312')
    expect(messages[0]!.name).toBe('Diana Zuñiga')
    expect(messages[0]!.text).toBe('Mi placa es BYF83F')
  })

  it('ignores non-text messages', () => {
    const body: WhatsAppWebhookBody = {
      ...SAMPLE_WEBHOOK,
      entry: [
        {
          id: '123',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '57300', phone_number_id: 'P' },
                messages: [
                  {
                    from: '573044666312',
                    id: 'wamid.xyz',
                    timestamp: '1708704000',
                    type: 'image',
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    }
    const messages = extractMessages(body)
    expect(messages).toHaveLength(0)
  })

  it('handles empty entry', () => {
    const body: WhatsAppWebhookBody = { object: 'whatsapp_business_account', entry: [] }
    expect(extractMessages(body)).toHaveLength(0)
  })

  it('handles status updates (no messages)', () => {
    const body: WhatsAppWebhookBody = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '123',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '57300', phone_number_id: 'P' },
                statuses: [
                  { id: 'wamid.abc', status: 'delivered', timestamp: '1', recipient_id: '57304' },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    }
    expect(extractMessages(body)).toHaveLength(0)
  })
})

describe('verifyWebhook', () => {
  it('validates correct verify token', () => {
    const result = verifyWebhook('subscribe', 'fotoman-verify', 'challenge123')
    expect(result.valid).toBe(true)
    expect(result.challenge).toBe('challenge123')
  })

  it('rejects wrong verify token', () => {
    const result = verifyWebhook('subscribe', 'wrong-token', 'challenge123')
    expect(result.valid).toBe(false)
  })

  it('rejects wrong mode', () => {
    const result = verifyWebhook('unsubscribe', 'fotoman-verify', 'challenge123')
    expect(result.valid).toBe(false)
  })

  it('rejects missing challenge', () => {
    const result = verifyWebhook('subscribe', 'fotoman-verify', null)
    expect(result.valid).toBe(false)
  })
})

describe('sendTextMessage', () => {
  it('returns true in mock mode (no token)', async () => {
    const result = await sendTextMessage({
      to: '573044666312',
      text: 'Hola, soy Fotoman',
    })
    expect(result).toBe(true)
  })
})
