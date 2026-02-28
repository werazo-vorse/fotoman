# Spec: Landing Page & Route Structure

> Status: Draft
> Author: Droid
> Date: 2026-02-24
> Last updated: 2026-02-24

## 1. What

A visually attractive landing page at `/` that explains what Fotoman does and drives users to the consultation flow. Restructure the web app into separate routes for each step of the user journey: landing, consultation, results, checkout, and dashboard.

## 2. Why

The current home page goes straight to a lookup form with no context. New users don't know what Fotoman is, how it works, or why they should trust it. A proper landing page builds trust, explains the value proposition, and converts visitors into users. Separate routes enable deep-linking, browser back/forward, and cleaner code organization.

## 3. Success Criteria

- [ ] SC1: `/` shows an attractive landing page with hero section, value proposition, how-it-works steps, social proof, and a prominent CTA button.
- [ ] SC2: `/consulta` shows the lookup form (cedula + plate).
- [ ] SC3: `/resultados` shows fotomultas with legal defenses (receives data via query params or session state).
- [ ] SC4: `/pago` shows the checkout/payment flow.
- [ ] SC5: `/panel` shows the user dashboard (spec 16).
- [ ] SC6: `/chat` keeps the existing AI chat interface for advanced users.
- [ ] SC7: Landing page is mobile-first, loads fast, and uses the existing Tailwind setup.
- [ ] SC8: Navigation between routes feels smooth (shared layout with header/footer).

## 4. Constraints

- C1: All in Spanish (Colombian, formal but accessible). No English copy on user-facing pages.
- C2: No external UI component libraries. Tailwind only.
- C3: Landing page must work without JavaScript (SSR content visible).
- C4: No stock photos. Use icons/illustrations or simple geometric elements.

## 5. Non-Goals

- NG1: Internationalization / English version.
- NG2: Blog or content marketing pages.
- NG3: SEO optimization beyond basic meta tags.

## 6. Interface Design

### Route Structure

```
packages/web/app/
├── page.tsx                  # Landing page (/)
├── layout.tsx                # Root layout (shared header/footer)
├── consulta/
│   └── page.tsx              # Lookup form (/consulta)
├── resultados/
│   └── page.tsx              # Results + selection (/resultados)
├── pago/
│   └── page.tsx              # Checkout (/pago)
├── panel/
│   ├── layout.tsx            # Dashboard layout (auth-protected)
│   └── page.tsx              # Dashboard (/panel)
├── chat/
│   └── page.tsx              # AI chat (/chat)
├── api/
│   ├── chat/route.ts         # (existing)
│   ├── lookup/route.ts       # (existing)
│   └── ...
└── components/
    ├── header.tsx             # Shared site header with nav
    ├── footer.tsx             # Shared site footer
    ├── lookup-form.tsx        # (existing, moved to /consulta)
    ├── results.tsx            # (existing, moved to /resultados)
    └── ...
```

### Landing Page Sections

1. **Hero**: Headline ("Impugna tus fotomultas con inteligencia artificial"), subheadline explaining the service, CTA "Consultar mis fotomultas".
2. **How it works**: 3-step visual (Consulta -> Analisis -> Impugnacion).
3. **Value proposition**: Key benefits (legal defenses, AI-powered, fast, affordable).
4. **Pricing**: Transparent -- $50,000 COP per fotomulta.
5. **Trust signals**: Legal references (Ley 1843, Sentencia C-038), success metrics placeholder.
6. **CTA footer**: Repeat CTA to `/consulta`.

## 7. Implementation Notes

- Move existing `LookupForm` to `/consulta/page.tsx`.
- Move existing `Results` to `/resultados/page.tsx`.
- Results page needs to receive lookup data. Use `searchParams` or a lightweight client-side store (React context / `sessionStorage`).
- The shared layout should have a clean header with logo + nav links (Consultar, Panel, Chat).
- Keep the existing chat at `/chat` as an alternative interface.

## 8. Test Plan

| # | Test Case | Input | Expected Output |
|---|-----------|-------|-----------------|
| 1 | Landing page renders | GET / | Hero section visible, CTA links to /consulta |
| 2 | Consulta page has form | GET /consulta | Cedula input, plate input, submit button |
| 3 | CTA navigates correctly | Click "Consultar" | Browser navigates to /consulta |
| 4 | Mobile layout works | Viewport 375px | No horizontal scroll, readable text |
| 5 | Shared header on all pages | Visit any route | Header with nav visible |

## 9. Open Questions

None.
