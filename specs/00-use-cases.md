# Use Cases

> Status: Draft
> Date: 2026-02-23

## Primary User

Regular Colombian citizen who received a fotomulta in Cali and wants to fight it with minimal effort. Non-technical. Communicates in Spanish. Likely found us via WhatsApp or social media.

## Core Use Cases

### UC1: Look Up My Fotomultas

**Actor**: Citizen
**Trigger**: User provides their vehicle plate number
**Flow**:
1. User enters plate number (web form or WhatsApp message)
2. System queries SIMIT via Verifik API
3. System returns list of active fotomultas with key details:
   - Infraction date, code, description
   - Resolution number (if issued)
   - Notification date (if available)
   - Amount owed
   - Current status (comparendo, resolution, cobro coactivo)
4. User sees their fotomultas in a clear, simple list

**Edge Cases**:
- No fotomultas found: "Good news -- no active fotomultas for this plate."
- Verifik API down: "We couldn't check right now. Try again in a few minutes."
- Invalid plate format: "That doesn't look like a Colombian plate. Check the format."

---

### UC2: Analyze My Defenses

**Actor**: Citizen
**Trigger**: User selects one or more fotomultas to analyze
**Flow**:
1. System asks targeted questions (only if data not available from SIMIT):
   - "Were you driving when this happened?" (C-038 defense)
   - "Did you receive a physical notification by mail?" (notification defense)
   - "Do you know the exact date you were notified?" (deadline calculation)
2. Analysis Engine evaluates each defense strategy per fotomulta
3. System presents results in plain Spanish:
   - Which defenses apply and why (simple explanation, not legal jargon)
   - Strength indicator per defense (strong / moderate / weak)
   - Recommended action: "We can fight this" or "This one is hard to contest"

**Output per fotomulta**:
- List of applicable defenses with plain-language explanation
- Overall recommendation (fight / pay / needs more info)

---

### UC3: Fight My Fotomulta (End-to-End)

**Actor**: Citizen
**Trigger**: User confirms they want to fight
**Flow**:
1. System collects personal data (if not already provided):
   - Full name, cedula number, city of issuance
   - Email address, physical address, phone number
2. System generates derecho de peticion PDF with:
   - All applicable defenses combined
   - Multiple fotomultas in a single document (if selected)
   - Correct legal references and boilerplate
3. User previews the document
4. User completes payment (flat fee per fotomulta)
5. User authorizes submission (one tap / one message)
6. System submits via email from peticiones@fotoman.co to Secretaria de Movilidad de Cali
7. System confirms submission and stores proof
8. Case enters tracking state

**User actions required**: Answer ~5 questions + pay + confirm submission. Target: under 10 minutes total.

---

### UC4: Track My Case

**Actor**: Citizen
**Trigger**: Automatic (system monitors deadlines after submission)
**Flow**:
1. System tracks the 15-business-day response deadline
2. Notifications sent at key milestones:
   - Day 0: "Your petition was submitted successfully. Reference: [radicado]"
   - Day 10: "The authority has 5 business days left to respond."
   - Day 16: "The authority missed the deadline. We can escalate."
3. If authority responds:
   - System notifies user with a summary
   - Advises next steps (accept, appeal, escalate)
4. If authority ignores:
   - System can generate a follow-up petition or tutela alert

**Case states**: `analyzing → document_ready → submitted → awaiting_response → responded → resolved | escalated`

---

### UC5: Batch Analysis (Multiple Fotomultas)

**Actor**: Citizen with multiple fotomultas
**Trigger**: SIMIT lookup returns multiple results
**Flow**:
1. System shows all fotomultas found
2. User selects which ones to fight (default: all defensible ones)
3. System generates a SINGLE document covering all selected fotomultas
4. Same submission and tracking flow as UC3, but for all selected fotomultas

---

## Platform-Specific Flows

### Web App Flow
```
Landing → Enter Plate → See Fotomultas → Answer Questions → See Analysis →
Confirm Fight → Enter Personal Data → Preview PDF → Authorize Submission →
Dashboard (track cases)
```

### WhatsApp Bot Flow
```
User: "Hola"
Bot: "Hola! Soy Fotoman. Envíame tu placa y te digo si tienes fotomultas."
User: "BYF83F"
Bot: "Encontré 2 fotomultas para BYF83F: [summary]. ¿Quieres que las analice?"
User: "Sí"
Bot: [asks targeted questions one by one]
Bot: "Buenas noticias. Las 2 fotomultas se pueden pelear. ¿Quieres que me encargue?"
User: "Sí"
Bot: [collects personal data via questions]
Bot: [sends PDF preview as document]
Bot: "El costo es $XX.XXX por fotomulta. ¿Quieres pagar con Nequi, Daviplata o tarjeta?"
User: "Nequi"
Bot: [sends payment link]
Bot: "Pago confirmado. ¿Autorizo enviar esto a la Secretaría de Movilidad?"
User: "Sí"
Bot: "Listo. Tu petición fue enviada. Te aviso cuando respondan."
```

## Non-Goals (v1)

- Lawyer/multi-client management
- Cities other than Cali (v1 focuses on Cali's Secretaria de Movilidad)
- Subscription or recurring payment models (flat fee per fotomulta only)
- Physical mail submission (email only in v1)
- Tutela generation (v1 only alerts, does not auto-generate tutela)
- SOAT/tecnico-mecanica related infractions (v1 focuses on dynamic infractions: speed, red light, pico y placa)
