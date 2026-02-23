# Spec: Deadline Tracker

> Status: Draft
> Author: Droid
> Date: 2026-02-23
> Last updated: 2026-02-23

## 1. What

Background job system using BullMQ + Redis that monitors response deadlines for submitted petitions. When a case is submitted, it schedules deadline checks. Notifies users when deadlines approach and when they expire (enabling silencio administrativo positivo).

## 2. Why

Per Ley 1755 de 2015, the government has 15 business days to respond to a derecho de peticion. If they don't respond, the petition is considered accepted (silencio administrativo positivo). Tracking these deadlines automatically is a key value proposition.

## 3. Success Criteria

- [ ] SC1: `scheduleDeadlineCheck(caseId, submissionDate)` creates a BullMQ job.
- [ ] SC2: Job calculates deadline as submissionDate + 15 business days using Colombian calendar.
- [ ] SC3: Warning notification sent at 12 business days (3 days before deadline).
- [ ] SC4: Expiration notification sent when deadline passes with no response.
- [ ] SC5: Case status updated to DEADLINE_WARNING or ESCALATED as appropriate.
- [ ] SC6: Graceful degradation if Redis is unavailable.

## 4. Constraints

- C1: Uses BullMQ with Redis (same Redis instance from Docker Compose).
- C2: Depends on @fotoman/core/calendar for business day math.
- C3: Depends on @fotoman/db for case status updates.

## 5. Non-Goals

- NG1: Real-time push notifications (email only for now).
- NG2: Government response parsing/automation.

## 6. Interface Design

```typescript
function scheduleDeadlineCheck(caseId: string, submissionDate: Date): Promise<void>
function processDeadlineCheck(caseId: string): Promise<void>
```

## 7. Test Plan

| # | Test Case | Expected |
|---|-----------|----------|
| 1 | scheduleDeadlineCheck creates job | Job queued with correct delay |
| 2 | processDeadlineCheck updates case when deadline passed | Status = ESCALATED |
| 3 | Deadline calculated using business days | Excludes weekends and holidays |

## 8. Open Questions

None.
