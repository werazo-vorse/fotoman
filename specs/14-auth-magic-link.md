# Spec: Authentication (NextAuth Magic Link)

> Status: Draft
> Author: Droid
> Date: 2026-02-24
> Last updated: 2026-02-24

## 1. What

Email-based passwordless authentication using NextAuth.js v5 with magic link sign-in via Resend. Required for the dashboard (`/panel`) so users can see their cases. Also used to associate cases with a persistent user identity across sessions.

## 2. Why

The dashboard needs to know which user is viewing it. Cedula-based lookup is insecure (anyone who knows a cedula could see cases). Magic link via email is frictionless (no password to remember), secure (email ownership verification), and aligns with the data we already collect (email is required for petition submission). Resend is already a project dependency for email submission.

## 3. Success Criteria

- [ ] SC1: User can sign in via email magic link at `/auth/signin`.
- [ ] SC2: Magic link emails are sent via Resend (existing dependency).
- [ ] SC3: Session persists across page reloads (JWT or database sessions).
- [ ] SC4: `/panel` is protected -- unauthenticated users are redirected to `/auth/signin`.
- [ ] SC5: After first sign-in, a User record is created in the DB (or linked if email matches existing user from case submission).
- [ ] SC6: Authenticated user's email is available in server components and API routes via `auth()`.
- [ ] SC7: Sign-out works and clears the session.
- [ ] SC8: Public routes (`/`, `/consulta`, `/resultados`, `/pago`, `/chat`) remain accessible without auth.

## 4. Constraints

- C1: NextAuth v5 (Auth.js) with App Router support.
- C2: Email provider only. No OAuth providers for MVP.
- C3: Resend as the email transport (not nodemailer).
- C4: Session strategy: JWT (simpler, no session table needed).
- C5: Magic link emails must be in Spanish.
- C6: NEXTAUTH_SECRET and RESEND_API_KEY in env.

## 5. Non-Goals

- NG1: Social login (Google, GitHub, etc.).
- NG2: Phone/SMS OTP authentication.
- NG3: Role-based access control (all authenticated users are equal).
- NG4: Custom sign-in page styling (functional is fine for MVP, polish later).

## 6. Interface Design

### Files

```
packages/web/
├── auth.ts                    # NextAuth config (exported auth, signIn, signOut)
├── middleware.ts               # Protect /panel routes
├── app/
│   ├── auth/
│   │   ├── signin/page.tsx    # Sign-in form (email input)
│   │   └── verify/page.tsx    # "Check your email" page
│   └── panel/
│       └── layout.tsx         # Auth-protected layout
```

### NextAuth Config

```typescript
// packages/web/auth.ts
import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Resend({
      from: 'Fotoman <noreply@fotoman.co>',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
  },
  callbacks: {
    async session({ session, token }) {
      // Attach user ID to session
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
})
```

### Middleware

```typescript
// packages/web/middleware.ts
export { auth as middleware } from './auth'

export const config = {
  matcher: ['/panel/:path*'],
}
```

### DB Integration

On first sign-in, check if a User record exists with that email:
- If yes: link session to existing user (they submitted a case before signing up).
- If no: create a new User record with email, platform=WEB.

## 7. Implementation Notes

- NextAuth v5 uses the `auth.ts` file at the package root, not inside `app/api/`.
- The `handlers` export creates the `GET` and `POST` route handlers for `/api/auth/[...nextauth]`.
- Resend provider in NextAuth sends a verification email with a magic link. User clicks it, gets a session cookie.
- JWT strategy means no `Session` or `VerificationToken` tables needed in Prisma. NextAuth handles tokens in cookies.
- However, the Resend email provider in NextAuth v5 DOES require a `VerificationToken` table for storing the magic link token. Add this to the Prisma schema.
- The User table already exists in the schema. NextAuth's `user` concept maps to our existing `User` model. Use the Prisma adapter or handle user creation manually in the `signIn` callback.

## 8. Test Plan

| # | Test Case | Input | Expected Output |
|---|-----------|-------|-----------------|
| 1 | Sign-in sends email | Enter valid email, submit | Resend API called, redirect to /auth/verify |
| 2 | Magic link creates session | Click link from email | Redirect to /panel, session cookie set |
| 3 | Protected route redirects | GET /panel (no session) | Redirect to /auth/signin |
| 4 | Public routes accessible | GET / (no session) | 200 OK, page renders |
| 5 | Existing user linked | Email matches existing User | Session linked to existing User.id |
| 6 | New user created | Email not in DB | New User record created |
| 7 | Sign-out clears session | Click sign out | Session cookie cleared, redirect to / |

## 9. Open Questions

- Q1: Should we use the NextAuth Prisma adapter (auto-manages User/Account/Session tables) or handle user creation manually? Prisma adapter is simpler but adds tables we may not need with JWT strategy. **Recommendation**: Use adapter for VerificationToken only, handle User linking manually.
