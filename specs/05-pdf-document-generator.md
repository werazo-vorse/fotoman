# Spec: PDF Document Generator

> Status: Implemented
> Author: Droid
> Date: 2026-02-23
> Last updated: 2026-02-23

## 1. What

Generates formal legal PDF documents (derechos de peticion) from structured case data. Takes a typed document input with petitioner info, fotomulta details, AI-generated hechos, selected defense references, and contact info -- produces an A4 PDF matching the format of Colombian legal petitions.

## 2. Why

The PDF is the deliverable product. It's what gets submitted to the Secretaria de Movilidad. It must look professional, contain precise legal language, and follow the exact structure expected by Colombian authorities. The AI agent writes the HECHOS section; everything else is template-based with variable interpolation.

## 3. Success Criteria

- [ ] SC1: `generatePetitionPdf(input)` returns a Buffer containing a valid PDF.
- [ ] SC2: PDF contains all 9 sections in correct order: header, petitioner ID, hechos, peticiones, fundamentos de derecho, refutacion, pruebas, notificaciones, signature.
- [ ] SC3: Supports multiple fotomultas in a single document (batch resolution numbers).
- [ ] SC4: Text wraps correctly on A4 pages with proper margins.
- [ ] SC5: Page breaks are handled automatically for long documents.
- [ ] SC6: Uses a standard font (Helvetica) with bold for section headers.
- [ ] SC7: Generated PDF matches the structure of the example document.

## 4. Constraints

- C1: Lives in `packages/pdf`. Depends on `@fotoman/core` for legal reference text.
- C2: All legal text in formal Colombian Spanish.
- C3: Uses `pdf-lib` (lightweight, zero native deps, works in Node.js).
- C4: Cedula number is included in the PDF (this is the ONLY place it appears -- never in LLM calls).

## 5. Non-Goals

- NG1: WYSIWYG template editor.
- NG2: Image embedding (SIMIT screenshots deferred to v2).
- NG3: Digital signature.

## 6. Interface Design

```typescript
interface PetitionInput {
  city: string
  date: string                    // DD/MM/YYYY
  authority: string               // e.g. 'SECRETARÍA DE MOVILIDAD DE CALI'
  petitioner: {
    fullName: string
    cedula: string
    cedulaCity: string
    email: string
    address: string
    phone: string
  }
  vehicle: {
    plate: string
    type: string
    brand: string
  }
  fotomultas: Array<{
    resolutionNumber: string
    comparendoNumber: string
    infractionDate: string
    infractionCode: string
  }>
  hechos: string[]                // AI-generated, one per numbered item
  peticiones: string[]            // Template-generated requests
  fundamentosDeDerecho: Array<{
    title: string
    text: string
  }>
  refutacion: string              // Template text
  pruebas: string[]               // Evidence descriptions
}

function generatePetitionPdf(input: PetitionInput): Promise<Uint8Array>
```

## 7. Implementation Notes

- Use `pdf-lib` with embedded standard fonts (no custom font files needed).
- Build a simple text layout engine: word wrap, page break, section headers.
- Each section is a function that writes to the current page/position.
- Legal text for fundamentos comes from the Legal KB via the input.

## 8. Test Plan

| # | Test Case | Expected |
|---|-----------|----------|
| 1 | Generate PDF with single fotomulta | Valid PDF buffer, > 0 bytes |
| 2 | Generate PDF with multiple fotomultas | All resolution numbers in header reference |
| 3 | PDF contains petitioner name | Name appears in document |
| 4 | PDF contains all section headers | HECHOS, PETICIONES, FUNDAMENTOS, etc. present |
| 5 | Long hechos text wraps correctly | No text overflow |
| 6 | PDF is valid (parseable by pdf-lib) | Can load generated PDF |

## 9. Open Questions

None.
