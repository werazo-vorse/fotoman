# Fotoman

AI-driven legal defense agent that fights fotomultas (automated traffic tickets) in Cali, Colombia. An LLM agent orchestrates the entire process: looks up fotomultas, reasons about legal defenses, writes personalized legal documents, submits them, analyzes government responses, and escalates when needed. Available as a web app and WhatsApp bot. The user talks to the AI -- the AI fights the fotomulta.

## Core Commands

- Install dependencies: `pnpm install`
- Run all tests: `pnpm test`
- Run single package tests: `pnpm --filter @fotoman/core test`
- Lint & type-check: `pnpm check`
- Auto-fix style: `pnpm check:fix`
- Start dev (web + db + redis): `docker compose up -d && pnpm dev`
- Build for production: `pnpm build`

> Every agent MUST run `pnpm check` and `pnpm test` before considering a task complete.

## Development Methodology: Spec-Driven Development (SDD)

This project follows SDD. Every feature goes through 4 phases. No phase may be skipped.

### Phase 1: SPECIFY

Write a spec BEFORE any code. Specs live in `specs/` as markdown files.

- Define WHAT is being built and WHY it matters
- List success criteria (how do we know it works?)
- List constraints (what must NOT happen?)
- List non-goals (what are we explicitly NOT building?)
- Resolve all ambiguity before moving to Phase 2

Use the template: `specs/_template.md`

### Phase 2: PLAN

Break the spec into concrete implementation tasks.

- Identify which files to create/modify
- Define the public interfaces and data types FIRST
- Write test cases from the success criteria BEFORE implementation
- Get approval on the plan before writing production code

### Phase 3: IMPLEMENT

Write code that satisfies the spec. Follow Red-Green-Refactor:

1. Write a failing test (Red)
2. Write minimal code to pass it (Green)
3. Clean up without changing behavior (Refactor)

- Implementation MUST stay within the spec's scope -- no scope creep
- If you discover the spec is incomplete, STOP and update the spec first
- Update `ARCHITECTURE.md` if introducing new modules or patterns

### Phase 4: VERIFY

Prove the implementation meets the spec.

- All tests pass
- Lint and type-check pass
- Success criteria from the spec are demonstrably met
- No regressions in existing tests
- Documentation is updated in the same commit

### SDD Rules for Agents

- **Never start coding without a spec.** If no spec exists for the feature, create one first.
- **Specs are living documents.** Update them when requirements change, in the same PR as the code change.
- **Specs are the source of truth.** If spec and code disagree, the spec wins -- fix the code.
- **Small specs > big specs.** One spec per independently deliverable feature. If a spec exceeds 100 lines, decompose it.
- **Specs must be reviewable.** Written for humans, not just machines. Clear language, concrete examples.

## Documentation Rules

These rules exist to prevent stale documentation. Every agent MUST follow them.

### Rule 1: Docs live next to code

Documentation for a module lives in the same directory as the code it describes. Never create a separate `docs/` tree that mirrors `src/`. The only root-level docs are this file and `ARCHITECTURE.md`.

### Rule 2: Single source of truth

Never duplicate information. If something is already documented in one place, link to it. If you need to move information, delete the old copy in the same commit.

### Rule 3: Update docs in the same PR as code changes

If you change behavior, update the corresponding documentation in the SAME commit or PR. Never create a "TODO: update docs later" -- do it now or not at all.

### Rule 4: Docs must be verifiable

Every documented command must actually work. Every documented API must actually exist. If a doc references a file path, that path must exist. Agents should verify doc accuracy before completing any task.

### Rule 5: Prefer code over comments

Self-documenting code with clear names > inline comments > external docs. Write docs only for the WHY, not the WHAT. The code is the WHAT.

### Rule 6: ARCHITECTURE.md is the map

`ARCHITECTURE.md` is the single living document that describes the system's high-level structure. It must be updated whenever a new module, service, or major pattern is introduced. Keep it under 200 lines.

### Rule 7: No orphan docs

When deleting code, delete its documentation too. When renaming a module, update all references. Grep for the old name before marking the task complete.

## Architecture Overview

See `ARCHITECTURE.md` for the full system map.

### Domain Context

This system operates in the Colombian traffic law domain. Key legal references:

- **Ley 1843 de 2017**: Regulates fotomultas. Art. 8 requires notification within 13 business days.
- **Sentencia C-038/2020**: Corte Constitucional ruled solidary liability unconstitutional. State must identify the driver.
- **Sentencia C-321/2022**: Reinforces that sanctions cannot be automatic; due process required.
- **Sentencia T-051/2016**: State bears burden of proof on notification delivery.
- **Art. 161 Codigo Nacional de Transito**: Caducidad -- 1 year from infraction to sanction.
- **Art. 159 Ley 769/2002**: Prescripcion -- 3 years from sanction to collect.
- **Resolucion 718/2018**: Technical requirements for cameras (visible at 500m, fixed only, calibration required).

### Defense Strategies

The AI agent reasons about these defenses using the Legal Knowledge Base. It decides which apply based on case data and user input -- not hardcoded if/else.

1. **Invalid Notification**: infraction_date + notification_date > 13 business days = invalid
2. **Driver Not Identified (C-038/2020)**: Camera captures plate, not driver. Owner != driver.
3. **Caducidad**: infraction_date + 1 year without resolution = expired
4. **Prescripcion**: resolution_date + 3 years without cobro coactivo = prescribed
5. **Technical Violations**: Missing signage, no MinTransporte authorization, no calibration cert

### Document Generation (Hybrid AI + Templates)

The AI agent writes the case-specific sections. Legal boilerplate uses validated templates.

| Section | Generated by | Why |
|---|---|---|
| Header | Template | Fixed format (city, date, addressee) |
| Petitioner ID | Template | Fixed legal preamble + user data interpolation |
| **Hechos (facts)** | **AI Agent** | Personalized narrative per case. This is the AI's main value. |
| Peticiones | Template | Standardized legal requests. Must be exact. |
| Fundamentos de Derecho | Template + KB validation | Legal citations must be precise. AI selects which to include, but text comes from KB. |
| Refutacion | Template | Pre-emptive rebuttal of common government arguments. |
| Pruebas | Template | References to SIMIT screenshots. |
| Notificaciones | Template | Contact info interpolation. |
| Signature | Template | Name + cedula. |

### AI Architecture Rules

- **PII protection**: Cedula numbers are NEVER sent to the LLM API. Agent works with anonymized references. Cedula inserted at PDF generation time only, server-side.
- **Legal citations validated**: Every law, sentencia, or article the AI references is validated against the Legal Knowledge Base before reaching the user or the PDF.
- **Structured output**: All agent tool calls and responses use Zod schemas. No unstructured free-text in critical paths.
- **Human gate**: Agent cannot submit without explicit user confirmation + payment.

## Conventions & Patterns

### Code Style

- TypeScript strict mode
- Functional patterns preferred over OOP
- Use interfaces for public APIs
- No `any` types -- use proper typing or `unknown`
- Single quotes, trailing commas, no semicolons

### Naming

- Files: `kebab-case.ts`
- Functions/variables: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Test files: `*.test.ts` next to source file

### Error Handling

- Never swallow errors silently
- Use Result types or explicit error returns over try/catch where possible
- User-facing errors must be in Spanish
- Log errors in English for debugging

### Security

- Never log or expose user cedula numbers in plaintext outside the document generation step
- Never store sensitive user data at rest without encryption
- All API calls to external services (SIMIT, RUNT) must go through a backend proxy
- Never commit API keys, tokens, or credentials

## Git Workflow

1. Branch from `main`: `feature/<slug>` or `fix/<slug>`
2. Run lint + tests before committing
3. Atomic commits: `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`
4. PR description must explain WHY, not just WHAT
5. Never force-push `main`

## Gotchas

- Colombian business days exclude weekends AND public holidays. The holiday calendar changes yearly.
- SIMIT website has no official public API. Data extraction requires scraping or the Verifik third-party API.
- Legal document text must be in formal Colombian Spanish. Do not translate legal terms.
- Infraction codes (C14, C02, etc.) map to specific violations in the Codigo Nacional de Transito.
- The 13-day notification rule is in BUSINESS days, not calendar days.
