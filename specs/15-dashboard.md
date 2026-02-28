# Spec: Case Dashboard

> Status: Draft
> Author: Droid
> Date: 2026-02-24
> Last updated: 2026-02-24

## 1. What

A rich dashboard at `/panel` where authenticated users track their fotomulta cases. Shows a case list with status, a detailed case view with timeline, response deadline countdown, document downloads, and notification history.

## 2. Why

After the user pays and the petition is submitted, the process is not over. The authority has 15 business days to respond. The user needs to know: what's the status of my case? When is the deadline? Did the government respond? Can I download my documents? Without a dashboard, users will email or call asking for updates. The dashboard is self-service.

## 3. Success Criteria

- [ ] SC1: `/panel` requires authentication (redirect to `/auth/signin` if not logged in).
- [ ] SC2: Dashboard shows a list of all user's cases with: plate, number of fotomultas, status badge, submission date, deadline date.
- [ ] SC3: Each case is clickable and expands to show detailed view.
- [ ] SC4: Case detail shows a visual status timeline: Analisis -> Pagado -> Enviado -> Esperando respuesta -> Respondido/Resuelto.
- [ ] SC5: Active cases show a countdown: "X dias habiles restantes para respuesta" calculated from submission date.
- [ ] SC6: User can download the generated PDF from the case detail.
- [ ] SC7: Case detail shows notification/event history (CaseEvent records): when it was created, paid, submitted, deadline warnings, responses.
- [ ] SC8: Cases with expired deadlines (15 business days without response) show a visual alert and recommended next step.
- [ ] SC9: Empty state: if user has no cases, show a message with CTA to `/consulta`.

## 4. Constraints

- C1: Auth required. Uses NextAuth session from spec 14.
- C2: Data comes from the DB (Case, CaseEvent, CaseFotomulta tables).
- C3: Deadline countdown uses the Colombian business day calendar from `@fotoman/core/calendar`.
- C4: All text in Spanish.
- C5: Mobile-first layout.

## 5. Non-Goals

- NG1: Real-time updates (polling or WebSocket). User refreshes the page.
- NG2: Case editing or re-submission from the dashboard.
- NG3: Government response upload (manual process for now).
- NG4: Analytics or aggregate statistics.
- NG5: Admin view for managing all users' cases.

## 6. Interface Design

### Route Structure

```
packages/web/app/panel/
├── layout.tsx           # Auth-protected layout, sidebar nav
├── page.tsx             # Case list (/panel)
└── [caseId]/
    └── page.tsx         # Case detail (/panel/:caseId)
```

### Case List View

```
┌─────────────────────────────────────────────────┐
│  Mis Casos                                       │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │
│  │ 🏍️ BYF83F  ·  2 fotomultas             │    │
│  │ Estado: Esperando respuesta              │    │
│  │ Enviado: 24 feb 2026  ·  Vence: 17 mar  │    │
│  │ [8 dias habiles restantes]               │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │ 🚗 ABC123  ·  1 fotomulta               │    │
│  │ Estado: Resuelto ✓                       │    │
│  │ Enviado: 10 ene 2026  ·  Resuelto: 28 ene│   │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### Case Detail View

```
┌─────────────────────────────────────────────────┐
│  Caso BYF83F  ·  2 fotomultas                   │
│  Estado: Esperando respuesta                     │
├─────────────────────────────────────────────────┤
│                                                   │
│  LINEA DE TIEMPO                                 │
│  ● Creado ─── ● Pagado ─── ● Enviado ─── ○ Resp │
│  23 feb        23 feb       24 feb         ?     │
│                                                   │
│  ⏱ PLAZO DE RESPUESTA                           │
│  8 de 15 dias habiles transcurridos              │
│  ████████░░░░░░░  Vence: 17 mar 2026            │
│                                                   │
│  FOTOMULTAS IMPUGNADAS                           │
│  • C14 - No respetar señales ($468,500)          │
│    Defensa: Indebida notificacion                │
│  • C14 - No respetar señales ($468,500)          │
│    Defensa: Conductor no identificado            │
│                                                   │
│  DOCUMENTOS                                       │
│  📄 Derecho de peticion (PDF)  [Descargar]       │
│                                                   │
│  HISTORIAL                                        │
│  24 feb 14:30  Peticion enviada a movilidad@...  │
│  24 feb 14:29  Documento PDF generado            │
│  24 feb 14:28  Pago confirmado ($100,000 COP)    │
│  23 feb 20:15  Caso creado                       │
│                                                   │
└─────────────────────────────────────────────────┘
```

### Data Types

```typescript
// API response for dashboard
interface DashboardCase {
  id: string
  plate: string
  vehicleType: string
  status: CaseStatus
  fotomultaCount: number
  defensesApplied: string[]
  submissionDate: string | null
  deadlineDate: string | null
  businessDaysElapsed: number | null
  businessDaysRemaining: number | null
  deadlineExpired: boolean
  createdAt: string
}

interface CaseDetail extends DashboardCase {
  fotomultas: {
    comparendoNumber: string
    infractionCode: string
    infractionDescription: string
    amount: number
    applicableDefenses: string[]
  }[]
  events: {
    type: CaseEventType
    details: string | null
    createdAt: string
  }[]
  documentPdfUrl: string | null
  submissionProof: string | null
  authorityEmail: string | null
}
```

### API Routes

```typescript
// GET /api/panel/cases
// Returns all cases for authenticated user
// Response: DashboardCase[]

// GET /api/panel/cases/[caseId]
// Returns detail for a single case
// Response: CaseDetail
```

## 7. Implementation Notes

- Use server components for initial data fetch (faster, no loading spinner for initial render).
- Deadline calculation: `addBusinessDays(submissionDate, 15)` from `@fotoman/core/calendar`. Compare with today to get remaining days.
- Status badges use the same color scheme as the existing defense labels in `results.tsx`.
- PDF download: serve from DB (`documentPdf` Bytes field) via an API route `/api/panel/cases/[caseId]/pdf`.
- The CaseEvent table already tracks all events. Query by `caseId` ordered by `createdAt DESC`.
- Empty state: friendly message with illustration/icon and link to `/consulta`.
- Deadline expired alert: if `businessDaysRemaining <= 0` and status is still `AWAITING_RESPONSE`, show a red banner: "El plazo de respuesta ha vencido. Puede interponer accion de tutela."

## 8. Test Plan

| # | Test Case | Input | Expected Output |
|---|-----------|-------|-----------------|
| 1 | Dashboard requires auth | GET /panel (no session) | Redirect to /auth/signin |
| 2 | Shows user's cases | Authenticated user with 2 cases | 2 case cards rendered |
| 3 | Empty state | Authenticated user with 0 cases | "No tiene casos" + CTA |
| 4 | Case detail loads | Click on case card | Timeline, events, fotomultas shown |
| 5 | Deadline countdown correct | Case submitted 5 biz days ago | "10 dias habiles restantes" |
| 6 | Expired deadline alert | Case submitted 16+ biz days ago | Red banner with tutela rec |
| 7 | PDF download works | Click "Descargar" | PDF file downloaded |
| 8 | Events in chronological order | Case with 4 events | Most recent first |

## 9. Open Questions

None.
