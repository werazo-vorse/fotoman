# Spec: Fotomulta Selection & Checkout Flow

> Status: Draft
> Author: Droid
> Date: 2026-02-24
> Last updated: 2026-02-24

## 1. What

After SIMIT lookup, the user sees their fotomultas with applicable legal defenses per item. They select which fotomultas to fight, see dynamic pricing, and proceed to pay via Wompi. Once payment is confirmed, the system synchronously generates the derecho de peticion PDF and submits it via email to the Secretaria de Movilidad. The user sees a confirmation screen with submission proof.

## 2. Why

Users may not want to fight every fotomulta (some may already be paid, or have weak defenses). Letting them choose gives control and transparency. The pay-first-then-auto-generate flow is simpler for the user: one action triggers the entire legal fight. No back-and-forth between preview/pay/submit.

## 3. Success Criteria

- [ ] SC1: Results page (`/resultados`) shows each fotomulta as a selectable card with legal defenses, dates, and amounts.
- [ ] SC2: User can select/deselect individual fotomultas via checkboxes. At least one must be selected to proceed.
- [ ] SC3: A sticky bottom bar shows: number selected, total fee ($50,000 x N), and a "Proceder al pago" button.
- [ ] SC4: Before payment, user must provide personal data (name, cedula, email, phone, address, city). Form pre-fills from previous session if available.
- [ ] SC5: `/pago` page shows order summary (selected fotomultas, fee breakdown) and embeds Wompi payment widget or redirects to Wompi payment link.
- [ ] SC6: On payment confirmation (Wompi webhook or redirect), system synchronously: (a) generates the PDF with AI-written hechos, (b) submits via email.
- [ ] SC7: User sees a confirmation screen with: submission proof (email message ID), PDF download link, next steps (15 business days deadline), and link to dashboard.
- [ ] SC8: If payment fails or is declined, user stays on `/pago` with clear error message and retry option.
- [ ] SC9: Pricing is transparent: $50,000 COP per fotomulta selected. No hidden fees.

## 4. Constraints

- C1: Cedula is collected in the form but NEVER sent to the LLM. Only used server-side for PDF generation.
- C2: Payment must be confirmed before PDF generation. No documents generated for unpaid cases.
- C3: The AI agent (not a template) writes the HECHOS section of the document. All other sections use templates.
- C4: All legal citations in the generated document must be validated against the Legal KB before PDF output.
- C5: Submission email goes to `movilidad@cali.gov.co` with CC to the user's email.
- C6: The entire post-payment flow (generate + submit) must complete within 60 seconds.

## 5. Non-Goals

- NG1: Document preview before payment (user trusts the system; they can download after).
- NG2: Editing the generated document before submission.
- NG3: Support for cities other than Cali (MVP).
- NG4: Refund handling (manual for now).

## 6. Interface Design

### Data Flow Between Routes

```typescript
// Data passed from /consulta -> /resultados via sessionStorage
interface LookupSession {
  plate: string
  cedula: string
  ownerName: string
  vehicleType: string
  vehicleBrand: string
  fotomultas: FotomultaWithAnalysis[]
  totalAmount: number
}

interface FotomultaWithAnalysis {
  comparendoNumber: string
  resolutionNumber: string | null
  infractionDate: string
  notificationDate: string | null
  resolutionDate: string | null
  infractionCode: string
  infractionDescription: string
  amount: number
  status: string
  cameraLocation: string
  notificationBusinessDays: number | null
  applicableDefenses: string[]
}

// Data passed from /resultados -> /pago via sessionStorage
interface CheckoutSession {
  lookup: LookupSession
  selectedComparendos: string[] // comparendo numbers
  feePerFotomulta: number      // 5000000 (COP cents)
  totalFee: number             // feePerFotomulta * selectedComparendos.length
  userData: UserData
}

interface UserData {
  name: string
  cedula: string
  cedulaCity: string
  email: string
  phone: string
  address: string
  city: string
}
```

### API Routes

```typescript
// POST /api/process-case
// Called after payment confirmation. Generates PDF + submits.
interface ProcessCaseRequest {
  paymentReference: string
  selectedComparendos: string[]
  userData: UserData
  lookupData: LookupSession
}

interface ProcessCaseResponse {
  success: boolean
  caseId: string
  submissionProof: {
    messageId: string
    sentTo: string
    sentAt: string
  }
  pdfDownloadUrl: string
  deadlineDate: string // 15 business days from submission
}
```

### Results Page Selection UI

Each fotomulta card has:
- Checkbox (top-right)
- Infraction code + description
- Date + amount
- Defense badges (colored pills)
- Notification days analysis

Sticky bottom bar:
```
┌─────────────────────────────────────────────────┐
│ 2 fotomultas seleccionadas    $100,000 COP      │
│                            [Proceder al pago →]  │
└─────────────────────────────────────────────────┘
```

## 7. Implementation Notes

- Use `sessionStorage` to pass data between routes. If session is empty when landing on `/resultados` or `/pago`, redirect to `/consulta`.
- The personal data form appears on `/resultados` below the fotomulta list, or as a step on `/pago` before the payment widget. Decide during implementation based on UX feel.
- Post-payment processing calls the existing `generateDocument` tool and `submitPetition` tool from `@fotoman/ai` -- but directly, not through the agent's LLM loop. The AI is only invoked for the HECHOS section.
- Create a new API route `POST /api/process-case` that orchestrates: validate payment -> generate PDF -> submit email -> create DB records -> return proof.
- Wompi integration: use payment link redirect flow (simpler than embedded widget for MVP).

## 8. Test Plan

| # | Test Case | Input | Expected Output |
|---|-----------|-------|-----------------|
| 1 | Select single fotomulta | Click checkbox on one | Bottom bar shows 1 selected, $50,000 |
| 2 | Select all fotomultas | Click all checkboxes | Bottom bar shows N selected, $50,000 x N |
| 3 | Deselect all | Uncheck all | "Proceder" button disabled |
| 4 | Process case after payment | Valid payment ref + data | PDF generated, email sent, proof returned |
| 5 | Process case without payment | Invalid payment ref | 402 error, no PDF generated |
| 6 | Session empty on /resultados | Direct navigation | Redirect to /consulta |
| 7 | Generated PDF contains all selected fotomultas | 2 selected | PDF hechos mention both |
| 8 | Legal citations validated | Generated doc | All citations exist in Legal KB |

## 9. Open Questions

None.
