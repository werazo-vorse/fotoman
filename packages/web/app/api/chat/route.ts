import { anthropic } from '@ai-sdk/anthropic'
import { FOTOMAN_TOOLS } from '@fotoman/ai'
import { getSystemPrompt } from '@fotoman/ai'
import { type UIMessage, convertToModelMessages, stepCountIs, streamText } from 'ai'

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: getSystemPrompt(),
    messages: await convertToModelMessages(messages),
    tools: FOTOMAN_TOOLS,
    stopWhen: stepCountIs(10),
  })

  return result.toUIMessageStreamResponse()
}
