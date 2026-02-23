# Spec: Legal Knowledge Base

> Status: Implemented
> Author: Droid
> Date: 2026-02-23
> Last updated: 2026-02-23

## 1. What

A structured, typed collection of Colombian traffic law references used by the AI agent as context and by guardrails for citation validation. Contains the exact text of relevant laws, sentencias, articles, and defense strategy definitions. Lives in `packages/core/legal-kb/` as pure TypeScript data -- no I/O, no LLM calls.

## 2. Why

- The AI agent needs precise legal context to reason about defenses and write HECHOS narratives.
- Guardrails must validate that every law/sentencia the AI references actually exists and is cited correctly.
- Defense strategy logic (which defenses apply given case data) needs structured definitions.
- Keeping legal knowledge as typed data (not embedded in prompts) makes it testable, updatable, and auditable.

## 3. Success Criteria

- [ ] SC1: Every law, sentencia, and article referenced in `AGENTS.md` domain context is represented as a typed object.
- [ ] SC2: Each legal reference includes: key (unique ID), type (ley/sentencia/articulo/resolucion), citation (formal reference), summary (1-2 sentences), and full relevant text excerpt.
- [ ] SC3: Each defense strategy includes: key, name, applicable conditions (structured), required legal references (keys), and document section templates.
- [ ] SC4: `getLegalReference(key)` returns the reference or undefined. `getAllReferences()` returns all.
- [ ] SC5: `getDefenseStrategy(key)` returns strategy definition. `getAllStrategies()` returns all 5.
- [ ] SC6: `validateCitation(text)` checks if a citation string matches a known legal reference. Returns the match or null.
- [ ] SC7: All exported functions are pure, no side effects.

## 4. Constraints

- C1: Pure `packages/core` module. Zero runtime dependencies.
- C2: Legal text must be in formal Colombian Spanish -- never translate legal terms.
- C3: Data is read-only at runtime. Changes require code updates (not a database).

## 5. Non-Goals

- NG1: Full text of entire laws (only relevant articles/excerpts).
- NG2: Automatic updates from external legal databases.
- NG3: Semantic search over legal text (the agent gets full context, not RAG).

## 6. Interface Design

```typescript
// packages/core/legal-kb/index.ts

type ReferenceType = 'ley' | 'sentencia' | 'articulo' | 'resolucion' | 'codigo'

interface LegalReference {
  key: string                    // e.g. 'ley-1843-2017-art8'
  type: ReferenceType
  citation: string               // e.g. 'Artículo 8, Ley 1843 de 2017'
  shortName: string              // e.g. 'Notificación 13 días hábiles'
  summary: string                // 1-2 sentence summary
  fullText: string               // Relevant excerpt in formal Spanish
}

type DefenseKey =
  | 'indebida-notificacion'
  | 'conductor-no-identificado'
  | 'caducidad'
  | 'prescripcion'
  | 'vicios-tecnicos'

interface DefenseStrategy {
  key: DefenseKey
  name: string                   // Formal Spanish name
  description: string            // What this defense argues
  requiredRefs: string[]         // LegalReference keys needed
  applicableWhen: string         // Human-readable condition
}

function getLegalReference(key: string): LegalReference | undefined
function getAllReferences(): LegalReference[]
function getDefenseStrategy(key: DefenseKey): DefenseStrategy | undefined
function getAllStrategies(): DefenseStrategy[]
function validateCitation(text: string): LegalReference | null
```

## 7. Implementation Notes

- Data defined as `const` arrays with `as const` or `satisfies` for type safety.
- `validateCitation` does substring matching against citation strings and common aliases.
- Defense strategies reference legal KB keys so the agent can pull the exact text when building documents.
- The full text excerpts come from the example PDF document and official law text.

## 8. Test Plan

| # | Test Case | Input | Expected Output |
|---|-----------|-------|-----------------|
| 1 | Get known reference | `getLegalReference('ley-1843-2017-art8')` | Returns Ley 1843 Art 8 object |
| 2 | Get unknown reference | `getLegalReference('fake-key')` | Returns `undefined` |
| 3 | All references count | `getAllReferences()` | Returns at least 7 references |
| 4 | Get defense strategy | `getDefenseStrategy('indebida-notificacion')` | Returns notification defense |
| 5 | All strategies count | `getAllStrategies()` | Returns exactly 5 |
| 6 | Validate known citation | `validateCitation('Ley 1843 de 2017')` | Returns matching reference |
| 7 | Validate sentencia | `validateCitation('Sentencia C-038 de 2020')` | Returns matching reference |
| 8 | Validate unknown citation | `validateCitation('Ley imaginaria')` | Returns `null` |
| 9 | Defense refs exist | Every `requiredRefs` key in strategies | All resolve via `getLegalReference` |
| 10 | All references have required fields | All references | Non-empty key, citation, fullText |

## 9. Open Questions

None.
