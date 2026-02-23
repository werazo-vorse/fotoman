# Spec: SIMIT Connector (Mock)

> Status: Implemented
> Author: Droid
> Date: 2026-02-23
> Last updated: 2026-02-23

## 1. What

A mock SIMIT connector that returns realistic fotomulta data for given plate numbers. For MVP, this is a hardcoded data layer that the AI agent calls as a tool. The interface is designed so swapping in the real Verifik API later requires zero changes to the agent or any consumer.

## 2. Why

- The AI agent needs SIMIT data (fotomultas, dates, codes, amounts) to reason about defenses.
- Verifik API key is not yet available.
- Realistic mock data is needed for end-to-end testing of the full agent pipeline.
- The mock data must exercise all 5 defense strategies so the agent can be tested against each one.

## 3. Success Criteria

- [ ] SC1: `lookupFotomultas(plate)` returns a typed result with fotomulta array for known plates.
- [ ] SC2: Mock data includes at least 3 plates covering all 5 defense scenarios.
- [ ] SC3: Each fotomulta includes: comparendo number, resolution number, infraction date, notification date, infraction code, amount, status, camera location.
- [ ] SC4: Returns empty array for unknown plates (not an error).
- [ ] SC5: Interface is async (returns Promise) so swapping to real API is seamless.
- [ ] SC6: Mock data uses realistic dates relative to a configurable "now" date for test stability.

## 4. Constraints

- C1: Lives in `packages/core`. Zero external dependencies.
- C2: Async interface even though mock is synchronous.
- C3: No real HTTP calls. Pure data return.

## 5. Non-Goals

- NG1: Real Verifik API integration.
- NG2: Caching or rate limiting (not needed for mock).

## 6. Interface Design

```typescript
// packages/core/simit/types.ts

type FotomultaStatus = 'pending' | 'resolution' | 'cobro_coactivo' | 'paid'

interface Fotomulta {
  comparendoNumber: string
  resolutionNumber: string | null
  infractionDate: string        // YYYY-MM-DD
  notificationDate: string | null // YYYY-MM-DD, null if never notified
  resolutionDate: string | null   // YYYY-MM-DD
  infractionCode: string          // e.g. 'C14', 'C02'
  infractionDescription: string
  amount: number                  // COP
  status: FotomultaStatus
  cameraLocation: string
  plate: string
}

interface SimitResult {
  plate: string
  ownerName: string
  vehicleType: string
  vehicleBrand: string
  fotomultas: Fotomulta[]
}

// packages/core/simit/index.ts
function lookupFotomultas(plate: string): Promise<SimitResult | null>
```

## 7. Implementation Notes

- Mock data based on the real example: Diana Zuñiga, plate BYF83F, Moto triller, infractions C14.
- Additional mock plates to cover all defense scenarios.
- Dates should trigger specific defenses when analyzed with the calendar module.

## 8. Test Plan

| # | Test Case | Input | Expected Output |
|---|-----------|-------|-----------------|
| 1 | Known plate returns data | 'BYF83F' | SimitResult with fotomultas |
| 2 | Unknown plate returns null | 'ZZZ999' | null |
| 3 | Case insensitive lookup | 'byf83f' | Same as 'BYF83F' |
| 4 | All mock fotomultas have required fields | all | Non-null required fields |

## 9. Open Questions

None.
