import { anthropic } from '@ai-sdk/anthropic'
import { FOTOMAN_TOOLS, getSystemPrompt } from '@fotoman/ai'
import {
  extractMessages,
  sendTextMessage,
  verifyWebhook,
} from '@fotoman/core/whatsapp'
import type { WhatsAppWebhookBody } from '@fotoman/core/whatsapp'
import { generateText, type ModelMessage, stepCountIs } from 'ai'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  const result = verifyWebhook(mode, token, challenge)

  if (result.valid) {
    return new Response(result.challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(req: Request) {
  const body = (await req.json()) as WhatsAppWebhookBody

  // Always respond 200 immediately to Meta (they retry on non-200)
  const messages = extractMessages(body)

  if (messages.length === 0) {
    return NextResponse.json({ status: 'ok' })
  }

  // Process each message asynchronously (don't block the response)
  for (const msg of messages) {
    processMessage(msg.from, msg.name, msg.text).catch((err) => {
      console.error(`Error processing WhatsApp message from ${msg.from}:`, err)
    })
  }

  return NextResponse.json({ status: 'ok' })
}

async function processMessage(from: string, name: string, text: string) {
  // TODO: Load conversation history from DB for multi-turn
  const conversationMessages: ModelMessage[] = [
    { role: 'user', content: text },
  ]

  try {
    const { text: responseText } = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: getSystemPrompt(),
      messages: conversationMessages,
      tools: FOTOMAN_TOOLS,
      stopWhen: stepCountIs(10),
    })

    // Split long responses into chunks (WhatsApp has 4096 char limit)
    const chunks = splitMessage(responseText, 4000)

    for (const chunk of chunks) {
      await sendTextMessage({ to: from, text: chunk })
    }
  } catch (err) {
    console.error('Agent error:', err)
    await sendTextMessage({
      to: from,
      text: 'Disculpe, ocurrió un error procesando su mensaje. Por favor intente de nuevo en unos minutos.',
    })
  }
}

function splitMessage(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text]

  const chunks: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining)
      break
    }

    // Find last paragraph break within limit
    let splitIndex = remaining.lastIndexOf('\n\n', maxLength)
    if (splitIndex === -1 || splitIndex < maxLength / 2) {
      // Fall back to last newline
      splitIndex = remaining.lastIndexOf('\n', maxLength)
    }
    if (splitIndex === -1 || splitIndex < maxLength / 2) {
      // Fall back to last space
      splitIndex = remaining.lastIndexOf(' ', maxLength)
    }
    if (splitIndex === -1) {
      splitIndex = maxLength
    }

    chunks.push(remaining.slice(0, splitIndex))
    remaining = remaining.slice(splitIndex).trimStart()
  }

  return chunks
}
