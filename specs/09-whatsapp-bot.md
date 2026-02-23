# Spec: WhatsApp Bot

> Status: Draft
> Author: Droid
> Date: 2026-02-23
> Last updated: 2026-02-23

## 1. What

WhatsApp webhook handler that receives user messages via Meta Cloud API, routes them through the Fotoman AI agent, and sends responses back. Runs as Next.js API routes (not a separate server).

## 2. Why

WhatsApp is the most used messaging app in Colombia. Most Fotoman users will interact via WhatsApp. The same AI agent powers both web and WhatsApp -- only the I/O layer differs.

## 3. Success Criteria

- [ ] SC1: GET /api/whatsapp handles Meta webhook verification challenge.
- [ ] SC2: POST /api/whatsapp receives text messages and responds via Cloud API.
- [ ] SC3: Agent responses sent back as WhatsApp text messages.
- [ ] SC4: PDF documents sent as WhatsApp document messages.
- [ ] SC5: Graceful handling of non-text messages (stickers, images, etc.).

## 4. Constraints

- C1: Lives in packages/web/app/api/whatsapp/ (Next.js API route).
- C2: Uses Meta WhatsApp Cloud API directly (fetch, no SDK dependency).
- C3: Environment vars: WHATSAPP_TOKEN, WHATSAPP_VERIFY_TOKEN, WHATSAPP_PHONE_NUMBER_ID.
- C4: Agent runs non-streaming for WhatsApp (generateText, not streamText).

## 5. Non-Goals

- NG1: Interactive buttons/lists (v2).
- NG2: Voice/audio message handling.
- NG3: Group chat support.

## 6. Interface Design

```
GET  /api/whatsapp  → webhook verification
POST /api/whatsapp  → receive message → agent → respond
```

## 7. Test Plan

| # | Test Case | Expected |
|---|-----------|----------|
| 1 | GET with correct verify_token | Returns hub.challenge |
| 2 | GET with wrong verify_token | Returns 403 |
| 3 | POST with text message | Calls agent, sends response |
| 4 | POST with non-text message | Responds with "solo texto" |

## 8. Open Questions

- Need WhatsApp Business API access and phone number ID from Meta.
