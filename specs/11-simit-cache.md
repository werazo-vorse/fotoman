# Spec: SIMIT Verifik Cache

> Status: Draft
> Author: Droid
> Date: 2026-02-24
> Last updated: 2026-02-24

## 1. What

A local file-based cache for Verifik API responses that sits between `lookupFotomultas` and the real API. On first call for a given cedula, the response is fetched from Verifik and persisted to a gitignored `.simit-cache.json` file. Subsequent calls return the cached data without hitting the API. Existing `mock-data.ts` remains untouched for unit tests.

## 2. Why

Verifik API calls are expensive ($$ per query). During development we need to iterate on the UI, agent, and legal analysis using real data without burning API credits on every page reload or server restart. The mock data covers test scenarios but does not reflect real SIMIT responses. We need both: mocks for tests, cache for manual dev.

## 3. Success Criteria

- [ ] SC1: First `lookupFotomultas(plate, cedula)` call with `VERIFIK_TOKEN` set fetches from Verifik and writes the response to `.simit-cache.json`.
- [ ] SC2: Second call with same cedula returns cached data without an HTTP request.
- [ ] SC3: `.simit-cache.json` is in `.gitignore` -- never committed.
- [ ] SC4: When `VERIFIK_TOKEN` is not set, falls back to mock data (existing behavior unchanged).
- [ ] SC5: Cache can be manually cleared by deleting the file.
- [ ] SC6: Cache is keyed by cedula (not plate) since Verifik queries by document number.
- [ ] SC7: Unit tests continue to use mock data and never touch the cache file.

## 4. Constraints

- C1: Cache file lives at project root: `.simit-cache.json`.
- C2: No new dependencies. Uses `fs` from Node stdlib.
- C3: Cache is dev-only. In production (`NODE_ENV=production`) the cache is bypassed -- always calls Verifik.
- C4: Cache entries store the raw `SimitResult` plus a `cachedAt` ISO timestamp.

## 5. Non-Goals

- NG1: TTL-based cache expiration (manual delete is sufficient for dev).
- NG2: PostgreSQL-based cache (dev-only, local file is enough).
- NG3: Caching in production.

## 6. Interface Design

```typescript
// packages/core/simit/cache.ts

interface CacheEntry {
  result: SimitResult
  cachedAt: string // ISO 8601
}

type SimitCache = Record<string, CacheEntry> // keyed by cedula

function readCache(): SimitCache
function writeCache(cedula: string, result: SimitResult): void
function getCached(cedula: string): SimitResult | null
```

The existing `lookupFotomultas` function changes its logic to:

```typescript
async function lookupFotomultas(plate: string, cedula?: string): Promise<SimitResult | null> {
  const normalized = plate.toUpperCase().trim()

  if (cedula && process.env.VERIFIK_TOKEN) {
    // 1. Check cache first (dev only)
    if (process.env.NODE_ENV !== 'production') {
      const cached = getCached(cedula.trim())
      if (cached) return cached
    }

    // 2. Call Verifik
    const result = await lookupVerifik(cedula.trim(), process.env.VERIFIK_TOKEN)
    if (result) {
      // 3. Cache result (dev only)
      if (process.env.NODE_ENV !== 'production') {
        writeCache(cedula.trim(), result)
      }
      return result
    }
  }

  // 4. Fallback to mock data
  return MOCK_DATA[normalized] ?? null
}
```

## 7. Implementation Notes

- Use `fs.readFileSync` / `fs.writeFileSync` for simplicity (synchronous is fine for dev cache).
- Wrap reads in try/catch -- if file is corrupted or missing, return empty cache.
- The cache file path should be resolved relative to the monorepo root, not the package directory.

## 8. Test Plan

| # | Test Case | Input | Expected Output |
|---|-----------|-------|-----------------|
| 1 | No token: returns mock data | plate='BYF83F', no VERIFIK_TOKEN | Mock SimitResult |
| 2 | Unknown plate, no token | plate='ZZZ999', no VERIFIK_TOKEN | null |
| 3 | Cache read/write roundtrip | write then read same cedula | Same SimitResult |
| 4 | getCached returns null for missing cedula | unknown cedula | null |
| 5 | Corrupted cache file returns null | malformed JSON | null (no crash) |

## 9. Open Questions

None.
