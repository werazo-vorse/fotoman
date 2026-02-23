# Spec: Database Schema

> Status: Implemented
> Author: Droid
> Date: 2026-02-23
> Last updated: 2026-02-23

## 1. What

Prisma schema and database helpers for persisting users, vehicles, fotomultas, cases, case events, and conversation history. Lives in `packages/db/`. Uses PostgreSQL with pgcrypto for field-level encryption of sensitive data (cedula, address).

## 2. Why

- Cases need to persist across sessions so users can return and check status.
- Conversation history enables the agent to resume multi-turn interactions.
- Case events provide an audit trail for legal proceedings.
- Encrypted PII storage is a legal and ethical requirement.

## 3. Success Criteria

- [ ] SC1: Prisma schema defines all 6 entities: User, Vehicle, Fotomulta, Case, CaseEvent, Message.
- [ ] SC2: Sensitive fields (cedula, address) use encrypted string type.
- [ ] SC3: `prisma generate` succeeds and produces typed client.
- [ ] SC4: Seed script creates test data matching mock SIMIT data.
- [ ] SC5: Helper functions for CRUD operations are typed and exported.

## 4. Constraints

- C1: PostgreSQL only. No SQLite fallback.
- C2: Prisma as ORM. No raw SQL except for pgcrypto setup.
- C3: Schema must support both web and WhatsApp users (platform field).

## 5. Non-Goals

- NG1: Migration automation for production.
- NG2: Multi-tenancy.
- NG3: Full-text search.

## 6. Interface Design

```
User 1──N Vehicle
Vehicle 1──N Fotomulta
User 1──N Case
Case N──N Fotomulta (via CaseFotomulta)
Case 1──N CaseEvent
Case 1──N Message (conversation history)
```

## 7. Test Plan

| # | Test Case | Expected |
|---|-----------|----------|
| 1 | prisma generate succeeds | No errors |
| 2 | Schema has all 6+ models | Models defined |

## 8. Open Questions

None.
