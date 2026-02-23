# Spec: Payment Gateway (Wompi)

> Status: Draft
> Author: Droid
> Date: 2026-02-23
> Last updated: 2026-02-23

## 1. What

Wompi payment integration for processing flat-fee payments before petition submission. Creates payment links, tracks payment status, and blocks submission until payment confirmed.

## 2. Why

Payment before submission is a hard requirement. Wompi supports all Colombian payment methods: Nequi, Daviplata, PSE, credit/debit cards, Bancolombia button.

## 3. Success Criteria

- [ ] SC1: `createPaymentLink(caseId, amount)` returns a Wompi payment URL.
- [ ] SC2: Webhook receives payment confirmation and updates case status.
- [ ] SC3: `getPaymentStatus(reference)` checks current payment state.
- [ ] SC4: Mock mode for development.

## 4. Constraints

- C1: Uses Wompi REST API (no SDK needed, simple fetch calls).
- C2: Amount in COP cents. Flat fee per fotomulta.
- C3: WOMPI_PRIVATE_KEY and WOMPI_PUBLIC_KEY in env.
- C4: Signature validation on webhooks for security.

## 5. Non-Goals

- NG1: Recurring payments / subscriptions.
- NG2: Refund automation.

## 6. Interface Design

```typescript
interface PaymentLink {
  url: string
  reference: string
  amount: number // COP cents
}

function createPaymentLink(input: { caseId: string; amount: number; description: string }): Promise<PaymentLink>
function getPaymentStatus(reference: string): Promise<'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR'>
```
