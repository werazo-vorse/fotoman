# Fotoman Implementation Audit Report

> Generated: 2026-02-26

## Executive Summary

The codebase has solid foundations across all packages. The **core** deterministic modules (calendar, legal-kb, SIMIT, email, payments, WhatsApp) are fully implemented with real API integrations + mock fallbacks. The **AI agent** is fully wired with 11 tools. The **PDF generator** produces valid legal documents. The **web app** has a complete route structure (landing → consulta → resultados → pago → panel) and the end-to-end flow works for the happy path.

**Critical blocker**: The `/api/process-case` route does NOT persist anything to the database — it generates the PDF, sends the email, and returns a response, but never creates Case, User, Vehicle, Fotomulta, or CaseEvent records. This means the dashboard (`/panel`) will always be empty and case tracking is broken.

---

## Package-by-Package Audit

### 1. `@fotoman/core` — ✅ Mostly Complete

| Module | Status | Details |
|--------|--------|---------|
| `simit/index.ts` | ✅ Working | Orchestrates Verifik → cache → mock fallback |
| `simit/verifik.ts` | ✅ Implemented | Real Verifik API integration. Maps response to `SimitResult` |
| `simit/cache.ts` | ✅ Implemented | File-based dev cache per spec 11 |
| `simit/scraper.ts` | ⚠️ Implemented but fragile | Playwright-based SIMIT scraper. Not used in main flow (Verifik is primary). Depends on `playwright` which is a heavy dep for `core` |
| `simit/mock-data.ts` | ✅ Complete | 4 mock plates with varied scenarios (BYF83F, ABC123, ZGY80F, XYZ789) |
| `calendar/index.ts` | ✅ Complete | `isBusinessDay`, `businessDaysBetween`, `addBusinessDays` with Colombian holidays via `colombian-holidays` |
| `legal-kb/` | ✅ Complete | 11 legal references, 5 defense strategies, citation validator with aliases |
| `email/index.ts` | ✅ Working | Resend integration + mock fallback. `sendPetition`, `buildSubmissionSubject`, `buildSubmissionBody` |
| `payments/index.ts` | ✅ Working | Wompi payment link creation + status check + mock fallback. `FOTOMULTA_FEE_COP_CENTS = 5000000` |
| `whatsapp/` | ✅ Working | Cloud API client: `extractMessages`, `sendTextMessage`, `sendDocument`, `verifyWebhook` |

**Gaps in core:**
- Lookup tool only accepts `plate` param but the actual function also needs `cedula`. The AI tool `lookupFotomultasTool` only passes `plate`, not `cedula`, so when used via the AI agent chat, it can never trigger Verifik and always falls back to mock data.

---

### 2. `@fotoman/ai` — ✅ Implemented

| Component | Status | Details |
|-----------|--------|---------|
| `agent.ts` | ✅ Working | `createFotomanAgent` wraps `streamText` with tools + system prompt |
| `system-prompt.ts` | ✅ Complete | Rich prompt with legal context injected. Covers 5 phases (consulta → datos → documento → pago → envio) |
| `tools/lookup.ts` | ⚠️ Partial | Only passes `plate`, never `cedula` — always falls back to mock |
| `tools/calendar.ts` | ✅ Complete | 3 tools: calculate, add, isBusinessDay |
| `tools/legal-kb.ts` | ✅ Complete | 4 tools: getRef, getStrategy, listAll, validateCitation |
| `tools/document.ts` | ✅ Working | Calls `@fotoman/pdf` generators, returns base64 PDF |
| `tools/payment.ts` | ✅ Working | Creates Wompi payment link via core |
| `tools/submit.ts` | ✅ Working | Sends email via core |

**11 tools total** — matches architecture spec.

**Gaps in ai:**
- `lookup_fotomultas` tool schema doesn't include `cedula` parameter, so the agent can never trigger real Verifik lookups through the chat interface.

---

### 3. `@fotoman/pdf` — ✅ Complete

| Component | Status | Details |
|-----------|--------|---------|
| `generator.ts` | ✅ Working | Full PDF generation: header → petitioner → hechos → peticiones → fundamentos → refutacion → pruebas → notificaciones → signature |
| `templates.ts` | ✅ Complete | `buildDefaultPeticiones`, `buildFundamentos`, `buildDefaultRefutacion`, `buildDefaultPruebas`. Fundamentos dynamically include only selected defense strategies |
| `layout.ts` | ✅ Complete | pdf-lib based A4 layout with text wrapping, pagination, bold/normal fonts |
| `types.ts` | ✅ Complete | All interfaces defined |

No gaps in PDF package.

---

### 4. `@fotoman/jobs` — ✅ Implemented, 🔴 Not Connected

| Component | Status | Details |
|-----------|--------|---------|
| `deadlines.ts` | ✅ Implemented | BullMQ queue. `scheduleDeadlineCheck` creates warning (day 12) and expiration (day 15) jobs |
| `processor.ts` | ✅ Implemented | Calls `updateCaseStatus` from `@fotoman/db` |
| `worker.ts` | ✅ Implemented | BullMQ worker that processes deadline jobs |

**Critical gap**: `scheduleDeadlineCheck()` is **never called** anywhere in the codebase. The `/api/process-case` route doesn't import or call it after successful submission. The jobs worker exists but will never have any jobs to process.

---

### 5. `@fotoman/db` — ✅ Schema & Service Layer Implemented, 🔴 Not Used by Main Flow

| Component | Status | Details |
|-----------|--------|---------|
| `prisma/schema.prisma` | ✅ Complete | User, Vehicle, Fotomulta, Case, CaseFotomulta, CaseEvent, Message. All enums defined |
| `src/cases.ts` | ✅ Implemented | `createCase`, `updateCaseStatus`, `storeCaseDocument`, `getCaseWithDetails`, `getCasesByUser`, `getCaseDocument` |
| `src/users.ts` | ✅ Implemented | `findOrCreateUser`, `findUserByCedula`, `findUserByPhone` |
| `src/messages.ts` | ✅ Implemented | `saveMessage`, `getMessagesByCase` |
| `prisma/migrations/` | ✅ Exists | Initial migration present |

**Critical gap**: The DB service functions exist and are well-written, but `/api/process-case` — the main flow endpoint — **never calls any of them**. It generates a fake `caseId: \`case-${Date.now()}\`` instead of persisting to the database.

**Missing**: No `VerificationToken` table in Prisma schema for NextAuth magic link flow (required by the Resend provider in NextAuth v5).

---

### 6. `@fotoman/web` — ✅ UI Complete, 🔴 Backend Integration Gaps

#### Pages

| Route | Status | Details |
|-------|--------|---------|
| `/` (landing) | ✅ Complete | Hero, how-it-works, defenses, trust, pricing, FAQ, CTA. Polished. |
| `/consulta` | ✅ Working | Cedula + plate form → POST `/api/lookup` → saves to sessionStorage → navigates to `/resultados` |
| `/resultados` | ✅ Working | Reads sessionStorage. Selection cards with defense analysis, savings calculator, user data form. Saves checkout to sessionStorage → navigates to `/pago` |
| `/pago` | ✅ Working | Payment summary → calls `/api/payment` → calls `/api/process-case` → success screen with PDF download and deadline |
| `/chat` | ✅ Working | Wraps `Chat` component (AI streaming chat) |
| `/panel` | ⚠️ UI done, not functional | Auth guard commented out (`// TODO`). Fetches cases via `/api/panel/cases?email=` but passes empty email. Always shows empty state. |
| `/panel/[caseId]` | ⚠️ UI done, not functional | Auth guard commented out. Timeline, deadline countdown, event history, PDF download — all built but no data to display |
| `/auth/signin` | ✅ UI done | Email input form, calls `signIn('resend', ...)` |
| `/auth/verify` | ✅ UI done | "Check your email" page |

#### API Routes

| Route | Status | Details |
|-------|--------|---------|
| `POST /api/chat` | ✅ Working | Streams AI agent responses via Groq (llama-3.3-70b-versatile) |
| `POST /api/lookup` | ✅ Working | Calls `lookupFotomultas(plate, cedula)`, enriches with business day calculations and defense analysis |
| `POST /api/payment` | ✅ Working | Creates Wompi payment link (or mock) |
| `POST /api/process-case` | ⚠️ Partially working | Generates hechos via AI → builds PDF → sends email. **Does NOT persist to DB, does NOT schedule deadline jobs, does NOT verify payment status** |
| `GET /api/panel/cases` | ✅ Implemented | Queries DB for user's cases. Works if data existed |
| `GET /api/panel/cases/[caseId]` | ✅ Implemented | Queries DB for case detail with events and fotomultas |
| `GET /api/cases/[caseId]/pdf` | ✅ Implemented | Serves PDF from DB `documentPdf` Bytes field |
| `GET/POST /api/auth/[...nextauth]` | ⚠️ Exists | Route handler exists, delegates to `auth.ts`. But NextAuth Resend provider **requires a database adapter** or `VerificationToken` table that doesn't exist. Auth will fail at runtime. |
| `GET/POST /api/whatsapp` | ✅ Working | Webhook verification + message processing with full agent |

#### Auth & Middleware

| Component | Status | Details |
|-----------|--------|---------|
| `auth.ts` | ⚠️ Partial | NextAuth configured with Resend provider + JWT strategy. Missing database adapter for VerificationToken storage |
| `middleware.ts` | 🔴 Disabled | Auth middleware is completely commented out: `matcher: []` |

---

## User Flow Audit

### Step 1: User enters cedula/plate on `/consulta` → **✅ Working**
- Form submits to `/api/lookup`, which calls `lookupFotomultas(plate, cedula)`
- With `VERIFIK_TOKEN`: real API → cache → fallback to mock
- Without token: falls back to mock data
- Result saved to `sessionStorage`, navigates to `/resultados`

### Step 2: System queries SIMIT → **✅ Working** (with caveats)
- Works via web flow (cedula passed explicitly)
- Does NOT work via AI chat (tool doesn't pass cedula)
- Mock data covers 4 scenarios adequately

### Step 3: AI analyzes legal defenses → **✅ Working**
- `/api/lookup` does server-side defense analysis (business day calc, caducidad, prescripcion)
- Results displayed on `/resultados` with strength indicators
- Chat agent can also analyze via tools

### Step 4: User selects fotomultas on `/resultados` → **✅ Working**
- Checkbox selection, defense cards, savings calculator
- User data form with all required fields
- Saves `CheckoutSession` to sessionStorage

### Step 5: System generates PDF → **✅ Working**
- `/api/process-case` generates AI-written hechos via Groq
- Builds PDF with `@fotoman/pdf` (templates + AI hechos)
- Returns base64 PDF to client for download

### Step 6: User pays on `/pago` → **⚠️ Partially Working**
- Creates Wompi payment link (or mock)
- **Does NOT actually verify payment was completed** before proceeding
- In the current flow, `handlePay` in `/pago` calls `/api/payment` (gets reference), then immediately calls `/api/process-case` with that reference — but process-case only checks if `paymentReference` is truthy, not whether Wompi confirmed the payment
- Mock payments always "work"

### Step 7: System submits petition via email → **✅ Working**
- With `RESEND_API_KEY`: sends real email with PDF attachment
- Without key: mock email (logged to console)
- Proper subject line and body text

### Step 8: System tracks deadline → **🔴 Not Working**
- `scheduleDeadlineCheck()` is never called after submission
- BullMQ worker exists but has no jobs
- No deadline tracking occurs

### Step 9: User monitors on `/panel` → **🔴 Not Working**
- Auth is disabled (middleware matcher is empty, auth guards commented out)
- NextAuth requires VerificationToken table that doesn't exist in schema
- `/api/process-case` never creates DB records, so panel queries return empty
- All UI components are built and ready — just no data

---

## Critical Blockers (Must Fix for Flow to Work)

| # | Blocker | Impact | Files Affected |
|---|---------|--------|----------------|
| **B1** | `/api/process-case` does not persist to database | Dashboard empty, no case tracking, no audit trail | `packages/web/app/api/process-case/route.ts` |
| **B2** | `scheduleDeadlineCheck()` never called | No deadline monitoring, user never notified | `packages/web/app/api/process-case/route.ts` |
| **B3** | NextAuth missing VerificationToken table | Magic link auth will crash at runtime | `packages/db/prisma/schema.prisma` |
| **B4** | Auth middleware disabled | `/panel` routes unprotected | `packages/web/middleware.ts`, `packages/web/app/panel/layout.tsx`, `packages/web/app/panel/page.tsx` |
| **B5** | No Wompi payment verification | Cases processed without confirmed payment | `packages/web/app/api/process-case/route.ts` |

---

## Integration Gaps

| # | Gap | Detail |
|---|-----|--------|
| **G1** | `lookupFotomultasTool` missing cedula param | AI agent tool schema only has `plate`. The underlying `lookupFotomultas(plate, cedula?)` needs cedula for Verifik. Agent chat always falls back to mock data. |
| **G2** | Process-case doesn't call `findOrCreateUser()` | User DB record never created from web flow |
| **G3** | Process-case doesn't call `createCase()` | Case DB record never created |
| **G4** | Process-case doesn't call `storeCaseDocument()` | PDF never stored in DB, so `/api/cases/[caseId]/pdf` returns 404 |
| **G5** | Process-case doesn't call `scheduleDeadlineCheck()` | No BullMQ jobs scheduled |
| **G6** | WhatsApp bot has no conversation persistence | `// TODO: Load conversation history from DB for multi-turn`. Each message processed in isolation. |
| **G7** | Dashboard API routes query by email but auth provides no email | Panel pages pass empty email to API routes (auth commented out) |
| **G8** | No Wompi webhook handler | No `POST /api/payment/webhook` route for Wompi to confirm payment asynchronously |
| **G9** | User model `cedula` is `@unique` but NextAuth links by email | Potential conflict: user created by case submission (has cedula), later signs in by email — linking logic not implemented |

---

## Non-Critical Gaps (Nice-to-Have)

| # | Gap | Detail |
|---|-----|--------|
| **N1** | `vicios-tecnicos` defense always listed as "media" strength | No data available to verify camera signage/calibration. Could be hidden or only shown when evidence exists. |
| **N2** | No rate limiting on API routes | No abuse protection on `/api/lookup`, `/api/chat`, etc. |
| **N3** | No SIMIT screenshot capture for evidence | Spec mentions "Pantallazos del sistema SIMIT" as proof but no screenshot functionality exists |
| **N4** | Scraper (`simit/scraper.ts`) not integrated into any flow | Was likely built as a backup for Verifik but never wired up |
| **N5** | No response analyzer | Architecture mentions "Response Analyzer" for when authority responds — not implemented |
| **N6** | Chat conversation not persisted to DB | `saveMessage`/`getMessagesByCase` exist in DB layer but chat route doesn't use them |
| **N7** | WhatsApp document sending not used | `sendDocument()` exists but agent never sends PDFs via WhatsApp |
| **N8** | No follow-up document generation | No "peticion de insistencia" or tutela template |
| **N9** | Data at rest not encrypted | Schema has `cedula` as plain text. Architecture requires pgcrypto encryption |
