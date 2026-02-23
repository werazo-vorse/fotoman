import { anthropic } from '@ai-sdk/anthropic'
import { FOTOMAN_TOOLS, getSystemPrompt } from '@fotoman/ai'
import {
  type UIMessage,
  convertToModelMessages,
  stepCountIs,
  streamText,
} from 'ai'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: getSystemPrompt(),
    messages: await convertToModelMessages(messages),
    tools: FOTOMAN_TOOLS,
    stopWhen: stepCountIs(10),
  })

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      if (error instanceof Error) {
        return error.message
      }
      return 'Error inesperado. Intente de nuevo.'
    },
  })
}
