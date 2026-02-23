# Architecture

> Last updated: 2026-02-23 | Status: Planning Phase

## System Overview

Fotoman is an AI-driven legal defense agent that fights fotomultas (automated traffic tickets) in Cali, Colombia. An LLM agent orchestrates the entire process: looks up fotomultas, reasons about legal defenses, writes personalized legal documents, submits them, analyzes government responses, and escalates when needed. The user's involvement is minimal -- the AI handles the fight.

```
User ↔ AI Agent ↔ Tools (SIMIT, Calendar, Legal KB, PDF, Email, Payments)
```

The system is built around a **central AI agent with tool-calling capabilities**, not hardcoded decision trees. The agent reasons about each case using legal knowledge, calls tools to gather data and take actions, and communicates with the user in natural conversational Spanish.

## AI-First Design Principles

1. **Agent, not workflow**: The LLM agent decides what to do next based on context, not a rigid step sequence. It calls tools as needed.
2. **Tools are the hands**: SIMIT lookup, calendar math, PDF generation, email submission -- these are tools the agent invokes via structured function calls.
3. **Legal Knowledge Base is the brain's memory**: Sentencias, leyes, and legal precedents are provided as structured context, not hardcoded in if/else logic.
4. **Guardrails enforce precision**: The agent reasons freely, but legal citations, article numbers, and sentencia references are validated against the knowledge base before output.
5. **Same agent, two interfaces**: Web and WhatsApp are just different surfaces for the same underlying agent.

## Platforms

- **Web App**: Chat-style + wizard UI. Mobile-first. User converses with the agent and sees structured results.
- **WhatsApp Bot**: Conversational flow via WhatsApp Cloud API. Same agent, adapted to message-based interaction.

Both platforms call the same AI agent backend.

## Core Architecture: AI Agent with Tools

```
┌─────────────────────────────────────────────────┐
│                  AI AGENT (LLM)                  │
│  Vercel AI SDK + Claude/GPT                      │
│  System prompt: legal expert in fotomultas       │
│  Speaks formal Colombian Spanish                 │
│                                                   │
│  Reasons about:                                   │
│  - Which defenses apply and why                   │
│  - What questions to ask the user                 │
│  - How to write personalized legal arguments      │
│  - How to interpret government responses          │
│  - When to escalate                               │
├─────────────────────────────────────────────────┤
│                    TOOLS                          │
│                                                   │
│  lookup_fotomultas(plate) → SIMIT data            │
│  calculate_business_days(from, to) → number       │
│  check_caducidad(infraction_date) → boolean       │
│  check_prescripcion(resolution_date) → boolean    │
│  get_legal_reference(key) → law text              │
│  generate_document(case_data) → PDF               │
│  submit_petition(pdf, authority) → proof           │
│  process_payment(amount, method) → confirmation   │
│  send_notification(user, message) → status         │
├─────────────────────────────────────────────────┤
│                  GUARDRAILS                       │
│                                                   │
│  - Legal citations validated against KB            │
│  - Structured output (Zod schemas) for all tools  │
│  - Human confirmation before submission            │
│  - Payment confirmation before submission          │
│  - No legal advice beyond fotomulta defense        │
│  - Sensitive data (cedula) never in LLM logs       │
└─────────────────────────────────────────────────┘
```

## Modules

### 1. AI Agent Core
The central intelligence. An LLM agent with a legal expert system prompt and tool-calling capabilities.
- **Vercel AI SDK** for agent orchestration, structured output, and tool calling
- **System prompt**: Expert Colombian traffic lawyer specialized in fotomultas. Knows all relevant laws, sentencias, and procedures. Communicates in formal Colombian Spanish.
- **Legal Knowledge Base**: Structured context injected into every agent call. Contains the exact text of Ley 1843/2017, Sentencia C-038/2020, C-321/2022, T-051/2016, Resolucion 718/2018, and relevant Codigo Nacional de Transito articles.
- **Tool definitions**: Typed (Zod) tool schemas that the agent can invoke
- **Conversation memory**: Per-case conversation history stored in DB
- **Multi-turn reasoning**: Agent asks user clarifying questions, gathers data via tools, then acts

### 2. Tool: SIMIT Connector
Fetches fotomulta data for a given plate number via Verifik API.
- Registered as an agent tool: `lookup_fotomultas(plate: string)`
- Returns structured data the agent can reason about
- **MVP**: Mocked with realistic test data. Verifik integration later.

### 3. Tool: Colombian Calendar
Business day arithmetic. Pure functions, no LLM needed -- deterministic math.
- `calculate_business_days(from: Date, to: Date) → number`
- `add_business_days(from: Date, days: number) → Date`
- `is_business_day(date: Date) → boolean`
- Colombian holidays (Ley 51/1983 + annual decrees)
- Registered as agent tools so the LLM can call them for deadline calculations

### 4. Tool: Document Generator
AI-assisted legal document generation with guardrails.
- **The agent writes the HECHOS section** -- personalized narrative of the case facts, in formal Colombian Spanish. This is where AI adds the most value vs templates.
- **Legal boilerplate sections are fixed templates** -- Fundamentos de Derecho, Peticiones, Refutacion. These contain exact law citations that must not be hallucinated.
- **Hybrid approach**: AI-generated narrative + template-based legal precision
- Validates all legal references against the Knowledge Base before PDF generation
- Uses pdfme for final PDF rendering

### 5. Tool: Submission Engine
Files the derecho de peticion on behalf of the user.
- `submit_petition(pdf: Buffer, authority_email: string) → SubmissionProof`
- Sends FROM Fotoman system email on behalf of user
- Agent calls this tool only after payment confirmation + user authorization
- Stores submission proof linked to case

### 6. Tool: Payment Gateway
Processes payment before submission.
- `process_payment(amount: number, method: string) → PaymentConfirmation`
- Wompi integration: Nequi, Daviplata, PSE, cards
- Agent triggers payment after document preview
- Submission blocked until payment confirmed

### 7. Case Tracker (Background Jobs)
Not an agent tool -- runs autonomously via BullMQ workers.
- Monitors 15-business-day response deadline per case
- On deadline events, triggers the agent to compose notifications or follow-up documents
- Case states: `analyzing → document_ready → paid → submitted → awaiting_response → responded → resolved | escalated`

### 8. Response Analyzer
When the authority responds, the AI agent reads and interprets the response.
- Agent analyzes the government's reply using legal KB context
- Determines: accepted (case won), rejected with reason, partial resolution, or needs escalation
- Recommends next steps to the user in plain Spanish
- Can auto-generate follow-up documents (peticion de insistencia, tutela alert)

### 9. Notification Service
- Agent composes notification messages in natural Spanish
- Delivered via WhatsApp (bot users) or Email (web users)
- Triggered by Case Tracker events or direct agent actions

### 10. Web Interface
Chat-style + structured panels. Mobile-first.
1. User enters plate → agent calls SIMIT tool → shows results
2. Agent asks clarifying questions in chat
3. Agent presents analysis with explanations in natural language
4. User confirms → agent generates document → preview panel
5. Payment widget → submission confirmation
6. Dashboard: case timeline, status, chat history with agent

### 11. WhatsApp Interface
Same agent, message-based.
- Natural conversation in Spanish (no rigid menu trees)
- Agent uses interactive buttons/lists for confirmations
- Sends PDF as document message
- Push notifications for case updates

## Data Flow (Agent-Driven)

The flow is NOT a rigid sequence. The agent decides what to do next based on context.

```
Typical happy path:

1.  User: "Tengo una fotomulta, mi placa es BYF83F"
2.  Agent calls lookup_fotomultas("BYF83F") → gets SIMIT data
3.  Agent calls calculate_business_days() for each fotomulta → checks deadlines
4.  Agent reasons: "2 fotomultas found. Both have notification issues. C-038 applies."
5.  Agent explains to user in plain Spanish: what was found, what defenses apply, why
6.  Agent asks: "¿Eras tú quien conducía?" (clarifying question for C-038)
7.  User: "No, estaba en mi trabajo"
8.  Agent incorporates this into the case narrative
9.  Agent calls generate_document(case_data) → produces PDF with AI-written hechos + template legal sections
10. Agent shows preview: "Revisa el documento. ¿Lo envío?"
11. User confirms → Agent calls process_payment() → payment widget
12. Payment confirmed → Agent calls submit_petition() → email sent
13. Agent: "Listo. Tu petición fue radicada. Te aviso en 15 días hábiles."
14. [Background] Case Tracker monitors deadline → triggers agent on events
15. [If response arrives] Agent reads response → analyzes → advises next step
```

## Data Storage

All user personal data (cedula, name, address, phone) encrypted at rest. Case metadata (dates, status, defense strategies) stored alongside.

### Entities
- **User**: name, cedula (encrypted), email, phone, address (encrypted), platform (web/whatsapp)
- **Vehicle**: plate, brand, type, owner (FK to User)
- **Fotomulta**: comparendo_number, resolution_number, infraction_date, notification_date, infraction_code, amount, status, vehicle (FK)
- **Case**: fotomultas (FK[]), defenses_applied[], document_url, submission_date, submission_proof, payment_id, state, deadline_date
- **CaseEvent**: case (FK), event_type, timestamp, details

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **AI** | **Vercel AI SDK** | Agent orchestration, tool calling, structured output, streaming |
| **LLM** | **Claude (Anthropic)** | Primary model. Strong at Spanish, legal reasoning, structured output |
| **Language** | **TypeScript (strict)** | Shared across all packages. Zod schemas for tool definitions |
| **Web + API** | **Next.js 15 (App Router)** | UI + API + AI routes. `useChat` hook for streaming agent responses |
| **Styling** | **Tailwind CSS** | Mobile-first utility classes |
| **Database** | **PostgreSQL + Prisma** | Case data, conversation history, user data (encrypted via pgcrypto) |
| **PDF** | **pdfme** | JSON template-based PDF generation. AI writes hechos, template holds legal boilerplate |
| **Jobs** | **BullMQ + Redis** | Deadline monitoring, background case tracking |
| **WhatsApp** | **Meta Cloud API** | Message I/O. Agent responses streamed back as WhatsApp messages |
| **Payments** | **Wompi** | Nequi, Daviplata, PSE, cards. Single Colombian gateway |
| **Email** | **Resend** | Petition submission + user notifications |
| **SIMIT** | **Verifik API** | Mocked for MVP. Structured SIMIT data |
| **Monorepo** | **pnpm workspaces** | Package management |
| **Containerization** | **Docker Compose** | Local dev: PostgreSQL + Redis + app + workers |

### Monorepo Structure

```
fotoman/
├── AGENTS.md
├── ARCHITECTURE.md
├── specs/
├── examples/
├── docker-compose.yml
├── packages/
│   ├── core/           → Deterministic logic (ZERO external deps)
│   │                     Calendar, date math, legal KB data
│   │                     100% unit testable
│   ├── ai/             → Agent definition, system prompt, tool schemas
│   │                     Vercel AI SDK orchestration
│   │                     Legal Knowledge Base (structured)
│   │                     Guardrail validators
│   ├── web/            → Next.js 15 (UI + AI chat route + API routes)
│   ├── whatsapp/       → WhatsApp webhook → agent bridge
│   ├── pdf/            → pdfme templates + hybrid generator (AI narrative + legal templates)
│   ├── jobs/           → BullMQ workers (deadline tracker, notification dispatcher)
│   └── db/             → Prisma schema, migrations, encryption helpers
├── package.json
└── pnpm-workspace.yaml
```

### Dependency Rule

```
web ──────→ ai, core, db, pdf
whatsapp ─→ ai, core, db, pdf
jobs ─────→ ai, core, db
ai ───────→ core  (agent uses core tools)
pdf ──────→ core
core ─────→ (nothing -- zero deps)
```

`core` = deterministic functions (calendar, date math, legal KB data).
`ai` = the agent that reasons using core tools + LLM. Depends on core, nothing else.
Both `web` and `whatsapp` are thin interfaces that call into `ai`.

## Development Methodology

This project uses **Spec-Driven Development (SDD)**. Every feature follows: Specify -> Plan -> Implement -> Verify. Specs live in `specs/` and are the source of truth. See `AGENTS.md` for full SDD rules and `specs/_template.md` for the spec format.

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **AI agent, not hardcoded workflow** | LLM agent reasons about each case. Can handle edge cases, write personalized arguments, and adapt to new legal precedents without code changes. |
| **Hybrid document generation** | AI writes the HECHOS (case narrative) -- personalized per case. Legal citations and boilerplate use validated templates -- zero hallucination risk on law references. |
| **Legal Knowledge Base as structured data** | Laws and sentencias stored as structured objects, not free text. Agent queries them. Guardrails validate any legal reference the AI outputs. |
| **Vercel AI SDK** | TypeScript-native. Built for Next.js. Tool calling, structured output (Zod), streaming. Same SDK works for web chat and WhatsApp. |
| **Tools as the action layer** | Agent calls typed tools (SIMIT lookup, calendar math, PDF gen, email). Tools are deterministic. Agent decides WHEN to call them. |
| **core = deterministic, ai = reasoning** | Calendar math and legal KB data are in `core` (pure, testable). Agent reasoning is in `ai` (LLM-dependent). Clear separation. |
| Web + WhatsApp dual platform | WhatsApp is the most used app in Colombia. Same agent serves both. |
| System email on behalf of user | Simpler than user email access. PDF has petitioner identity. |
| User data encrypted at rest | Cedulas, addresses stored encrypted. Legal obligation. |
| Flat fee per fotomulta | Sustainable model. Payment before submission. Wompi for Colombian methods. |
| SIMIT Connector mocked for MVP | Verifik API key pending. Build against mock, swap later. |
| Conversation history persisted | Agent needs multi-turn context. Stored per case in DB. Also serves as audit trail. |

## Guardrails

| Guardrail | What it prevents |
|---|---|
| **Legal citation validator** | Agent outputs a sentencia or article number → validated against KB. If not found, blocked. |
| **Structured output schemas** | Every tool call and agent response uses Zod schemas. No unstructured free-text in critical paths. |
| **Human confirmation gate** | Document preview + explicit user authorization required before submission. Agent cannot auto-submit. |
| **Payment gate** | Submission tool requires valid payment_id. Cannot be bypassed. |
| **Scope limiter** | System prompt constrains agent to fotomulta defense only. Will not provide general legal advice. |
| **PII protection** | Cedula numbers never included in LLM API calls. Agent works with anonymized case data. Cedula inserted only at PDF generation time, server-side. |
| **Rate limiting** | Agent calls per user per hour capped. Prevents abuse and controls LLM costs. |
