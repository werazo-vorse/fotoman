# Spec: Email Submission

> Status: Draft
> Author: Droid
> Date: 2026-02-23
> Last updated: 2026-02-23

## 1. What

Service module that sends the generated derecho de peticion PDF via email to the Secretaria de Movilidad, with a copy to the petitioner. Uses Resend as the email provider.

## 2. Why

Submission is the point where the legal document becomes an official petition. The system sends the PDF from the Fotoman system email (not the user's personal email), which creates a verifiable record. The user receives a copy for their records.

## 3. Success Criteria

- [ ] SC1: `sendPetition(input)` sends email with PDF attachment to authority.
- [ ] SC2: CC or BCC copy sent to petitioner's email.
- [ ] SC3: Returns message ID for tracking.
- [ ] SC4: Graceful error handling if email fails.
- [ ] SC5: Agent tool `submit_petition` wired to this service.

## 4. Constraints

- C1: Uses Resend SDK (`resend` npm package).
- C2: Sender is always the Fotoman system email, never the user's email.
- C3: RESEND_API_KEY stored in env, never in code.
- C4: Mock mode for development (no real emails sent without API key).

## 5. Non-Goals

- NG1: Email templates with HTML formatting (plain text is fine for legal submissions).
- NG2: Read receipts or delivery tracking beyond Resend's built-in.

## 6. Interface Design

```typescript
interface SubmissionInput {
  toEmail: string           // Authority email
  ccEmail: string           // Petitioner email (copy)
  subject: string           // e.g. "Impugnacion Resoluciones No. X y No. Y"
  bodyText: string          // Formal cover letter text
  pdfBuffer: Uint8Array     // Generated PDF
  pdfFilename: string       // e.g. "derecho-de-peticion-BYF83F.pdf"
  petitionerName: string    // For the "from" display name
}

interface SubmissionResult {
  success: boolean
  messageId?: string
  error?: string
}

function sendPetition(input: SubmissionInput): Promise<SubmissionResult>
```

## 7. Test Plan

| # | Test Case | Expected |
|---|-----------|----------|
| 1 | Mock mode returns success | { success: true, messageId: 'mock-...' } |
| 2 | Missing API key uses mock | No error thrown |
| 3 | Invalid email returns error | { success: false, error: '...' } |

## 8. Open Questions

- What is the Secretaria de Movilidad's official email for petitions?
