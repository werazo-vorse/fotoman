# Spec: AI Agent Core

> Status: Implemented
> Author: Droid
> Date: 2026-02-23
> Last updated: 2026-02-23

## 1. What

The central AI agent that orchestrates Fotoman's legal defense process. Built on Vercel AI SDK v6 with Claude as the LLM. The agent has a legal expert system prompt, tool-calling capabilities (SIMIT lookup, calendar math, legal KB queries), and guardrails for citation validation. Lives in `packages/ai/`.

## 2. Why

The agent is the brain of the system. Instead of hardcoded workflows, the LLM reasons about each case: which defenses apply, what questions to ask the user, how to write personalized legal arguments. This makes the system adaptable to edge cases and new legal precedents without code changes.

## 3. Success Criteria

- [ ] SC1: Agent can receive a plate number, call the SIMIT lookup tool, and explain findings in Spanish.
- [ ] SC2: Agent calls the calendar tool to calculate business days for notification deadline validation.
- [ ] SC3: Agent queries the legal KB to ground its reasoning in specific laws and sentencias.
- [ ] SC4: Agent produces a structured defense analysis (which defenses apply and why) for a given fotomulta.
- [ ] SC5: System prompt enforces Colombian Spanish, fotomulta-only scope, and formal legal language.
- [ ] SC6: All tools are defined with Zod schemas and have typed inputs/outputs.
- [ ] SC7: `streamText` integration works for real-time streaming to UI consumers.
- [ ] SC8: Agent is testable with a mock LLM provider (no real API calls needed for unit tests).

## 4. Constraints

- C1: Never send cedula numbers to the LLM API. Agent works with anonymized case data.
- C2: All legal citations in agent output must be validatable against the Legal KB.
- C3: Agent must not provide general legal advice -- only fotomulta defense.
- C4: `packages/ai` depends only on `packages/core`. No DB, no HTTP framework.
- C5: Vercel AI SDK v6 patterns: `tool()`, `inputSchema`, `generateText`/`streamText`, `stopWhen`.

## 5. Non-Goals

- NG1: Web or WhatsApp interface (those consume the agent, they don't live here).
- NG2: Document generation (separate package).
- NG3: Conversation persistence (handled by consumer via message history).
- NG4: Payment or submission logic.

## 6. Interface Design

```typescript
// packages/ai/agent.ts

import type { ModelMessage } from 'ai'

interface AgentConfig {
  model: Parameters<typeof streamText>[0]['model']
}

interface AgentResponse {
  stream: ReturnType<typeof streamText>
}

function createFotomanAgent(config: AgentConfig): {
  chat: (messages: ModelMessage[]) => AgentResponse
}

// packages/ai/tools/index.ts -- all agent tools exported
// packages/ai/system-prompt.ts -- the system prompt
// packages/ai/guardrails.ts -- citation validation middleware
```

## 7. Implementation Notes

- Use `@ai-sdk/anthropic` provider with `claude-sonnet-4-20250514` model.
- System prompt is ~800 words: Colombian traffic lawyer, formal Spanish, scope limited to fotomultas.
- Tools wrap `@fotoman/core` functions: `lookupFotomultas`, `calculateBusinessDays`, `getLegalReference`, etc.
- For testing: use `ai` SDK's mock provider or inject model as dependency.
- The agent uses multi-step calls (`stopWhen: stepCountIs(10)`) so it can call multiple tools and then respond.

## 8. Test Plan

| # | Test Case | Input | Expected |
|---|-----------|-------|----------|
| 1 | Agent has correct tools registered | Inspect tool definitions | All 5+ tools present with Zod schemas |
| 2 | System prompt contains key legal context | Read system prompt | Contains Ley 1843, C-038, scope limits |
| 3 | Tool schemas validate correct input | Pass valid/invalid data | Zod validation works |
| 4 | SIMIT tool wraps core function | Call with plate | Returns fotomulta data |
| 5 | Calendar tool wraps core function | Call with dates | Returns business day count |
| 6 | Legal KB tool wraps core function | Call with ref key | Returns legal reference |

## 9. Open Questions

None.
