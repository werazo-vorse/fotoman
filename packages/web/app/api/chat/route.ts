import { createGroq } from '@ai-sdk/groq'
import { FOTOMAN_TOOLS, getSystemPrompt } from '@fotoman/ai'
import {
  type UIMessage,
  convertToModelMessages,
  stepCountIs,
  streamText,
} from 'ai'

const groq = createGroq()

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
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
