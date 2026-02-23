# Spec: Colombian Calendar

> Status: Implemented
> Author: Droid
> Date: 2026-02-23
> Last updated: 2026-02-23

## 1. What

A deterministic business day calculator for Colombia. Provides functions to count business days between two dates, add/subtract business days to a date, and check if a date is a business day. Business days exclude weekends (Saturday, Sunday) and all 18 Colombian public holidays per year, calculated per Ley 51/1983 (Emiliani rule). This is a pure `packages/core` module with zero external runtime dependencies beyond `colombian-holidays`.

## 2. Why

Every legal defense depends on correct business day arithmetic:
- **Invalid Notification**: Was the citizen notified within 13 *business days* of the infraction?
- **Caducidad**: Has 1 year passed without resolution? (deadline calculations use business days)
- **Response Deadlines**: Authority has 15 *business days* to respond to a derecho de peticion.

Getting even one day wrong can invalidate an entire defense argument. This module is a tool the AI agent calls -- it must be 100% deterministic and testable.

## 3. Success Criteria

- [ ] SC1: `getHolidays(year)` returns all 18 Colombian holidays for any year from 1984 to 2099, with correct Emiliani (next Monday) shifts.
- [ ] SC2: `isBusinessDay(date)` returns `false` for Saturdays, Sundays, and all 18 holidays of the given year.
- [ ] SC3: `businessDaysBetween(from, to)` returns the correct count of business days between two dates (exclusive of `from`, inclusive of `to`). Returns negative if `to < from`.
- [ ] SC4: `addBusinessDays(from, days)` returns the date that is `days` business days after `from`. Supports negative values (subtract business days).
- [ ] SC5: Correctly handles year boundaries (e.g., Dec 28 → Jan 5 spanning New Year's holiday).
- [ ] SC6: Verified against known 2025 and 2026 Colombian holiday calendars from official sources.
- [ ] SC7: All functions are pure -- no side effects, no I/O, no system clock dependency (all dates passed as arguments).

## 4. Constraints

- C1: Must be a pure `packages/core` module. Zero runtime dependencies except `colombian-holidays` npm package (which handles Easter calculation and Emiliani shifts).
- C2: All date parameters use plain `Date` objects or ISO strings (`YYYY-MM-DD`). No custom date libraries (no dayjs, no date-fns, no luxon).
- C3: Must handle timezone correctly -- all calculations are date-only (no time component). Use UTC internally to avoid timezone drift.
- C4: Must not call any external API or access the system clock. Pure functions only.
- C5: Must follow project conventions: functional style, strict TypeScript, no `any` types.

## 5. Non-Goals

- NG1: Historical holidays before 1984 (Ley 51/1983 only applies from 1984 onwards).
- NG2: Half-day or partial business day calculations.
- NG3: Custom holiday lists or company-specific non-working days.
- NG4: Regional holidays (only national holidays).

## 6. Interface Design

```typescript
// packages/core/calendar/index.ts

/** A Colombian public holiday */
interface ColombianHoliday {
  /** Original date of the holiday (YYYY-MM-DD) */
  date: string
  /** Actual celebration date after Emiliani shift (YYYY-MM-DD) */
  celebrationDate: string
  /** Holiday name in Spanish */
  name: string
}

/** Get all 18 Colombian holidays for a given year */
function getHolidays(year: number): ColombianHoliday[]

/** Check if a date is a business day (not weekend, not holiday) */
function isBusinessDay(date: Date): boolean

/**
 * Count business days between two dates.
 * Exclusive of `from`, inclusive of `to`.
 * Returns negative if `to` is before `from`.
 */
function businessDaysBetween(from: Date, to: Date): number

/**
 * Add (or subtract) business days to a date.
 * Returns the resulting date.
 * `days` can be negative to go backwards.
 */
function addBusinessDays(from: Date, days: number): Date
```

## 7. Implementation Notes

- Use `colombian-holidays` npm package for holiday generation. It handles Easter calculation (Gauss algorithm), Emiliani rule (move to next Monday), and all 18 holidays. Well-maintained (1199 commits, MIT license).
- Wrap `colombian-holidays` output into our `ColombianHoliday` interface -- we don't expose the third-party types.
- For `isBusinessDay`: check `day !== 0 && day !== 6` (not weekend) AND date is not in the holiday list for that year.
- For `businessDaysBetween`: iterate day by day from `from` to `to`, counting business days. For the ranges we deal with (max ~3 years), this is fast enough. No need for optimization.
- For `addBusinessDays`: step forward (or backward) one day at a time, counting only business days until we reach the target count.
- Use `Date.UTC()` internally. Strip time component from all input dates to avoid timezone issues.
- Cache holiday lists per year in a `Map<number, Set<string>>` for O(1) lookups during iteration.

### Key Colombian Holiday Categories (for reference)

**Fixed date (6):** Jan 1, May 1, Jul 20, Aug 7, Dec 8, Dec 25
**Easter-based (5):** Holy Thursday (Easter-3), Good Friday (Easter-2), Ascension (Easter+43 → next Mon), Corpus Christi (Easter+64), Sacred Heart (Easter+71)
**Emiliani/movable (7):** Epiphany (Jan 6→Mon), St Joseph (Mar 19→Mon), Saints Peter & Paul (Jun 29→Mon), Assumption (Aug 15→Mon), Columbus Day (Oct 12→Mon), All Saints (Nov 1→Mon), Independence of Cartagena (Nov 11→Mon)

Note: Ascension, Corpus Christi, and Sacred Heart are Easter-based but also shifted to Monday per the Emiliani law. The `colombian-holidays` package handles this correctly by returning the `celebrationDate` already shifted.

## 8. Test Plan

| # | Test Case | Input | Expected Output |
|---|-----------|-------|-----------------|
| 1 | Weekend detection | Saturday 2026-02-28 | `isBusinessDay` → `false` |
| 2 | Weekday non-holiday | Tuesday 2026-02-24 | `isBusinessDay` → `true` |
| 3 | Fixed holiday | 2026-01-01 (Año Nuevo, Thursday) | `isBusinessDay` → `false` |
| 4 | Emiliani holiday | 2026-01-12 (Reyes Magos, shifted to Monday) | `isBusinessDay` → `false` |
| 5 | Emiliani original date is workday | 2026-01-06 (original Reyes Magos, Tuesday) | `isBusinessDay` → `true` |
| 6 | Business days simple | from: 2026-01-05 (Mon), to: 2026-01-09 (Fri) | `businessDaysBetween` → 4 (Tue-Fri) |
| 7 | Business days across holiday | from: 2025-12-31 (Wed), to: 2026-01-02 (Fri) | `businessDaysBetween` → 1 (Jan 1 is holiday, only Jan 2 counts) |
| 8 | Business days across year boundary | from: 2025-12-24, to: 2026-01-05 | Count excluding Dec 25, Jan 1, weekends |
| 9 | Business days negative | from: 2026-01-09, to: 2026-01-05 | `businessDaysBetween` → -4 |
| 10 | Business days same date | from: 2026-03-02, to: 2026-03-02 | `businessDaysBetween` → 0 |
| 11 | Add 13 business days (notification rule) | from: 2026-06-01 (Mon) | Verify against manual count with June holidays |
| 12 | Add business days across Semana Santa | from: 2026-03-30 (Mon), add 5 | Must skip Apr 2 (Jueves Santo), Apr 3 (Viernes Santo) |
| 13 | Subtract business days | from: 2026-01-16, days: -5 | Must skip Jan 12 (Reyes Magos) |
| 14 | Holiday count per year | year: 2026 | `getHolidays` returns exactly 18 |
| 15 | Holiday count per year | year: 2025 | `getHolidays` returns exactly 18 |
| 16 | 2026 holidays match official calendar | year: 2026 | Verify all 18 celebration dates against Buk/festivos.com.co published list |
| 17 | 2025 holidays match official calendar | year: 2025 | Verify all 18 celebration dates |
| 18 | Zero business days added | from: 2026-03-02, days: 0 | Returns same date |

## 9. Open Questions

All resolved:
- ~~Q1: Build holiday calculation from scratch or use existing library?~~ **Resolved**: Use `colombian-holidays` npm package. Well-tested, handles all edge cases including Easter and Emiliani.
- ~~Q2: Include/exclude boundary dates?~~ **Resolved**: `businessDaysBetween(from, to)` is exclusive of `from`, inclusive of `to`. This matches the legal counting convention: "13 business days from the date of infraction" means the infraction date itself is day 0.
