import { describe, expect, it } from 'vitest'
import {
  FOTOMULTA_FEE_COP_CENTS,
  createPaymentLink,
  formatAmountCOP,
  getPaymentStatus,
} from './index.js'

describe('createPaymentLink', () => {
  it('returns mock link when no API key', async () => {
    const link = await createPaymentLink({
      caseId: 'case-123',
      amountInCents: FOTOMULTA_FEE_COP_CENTS,
      description: 'Impugnacion 2 fotomultas - BYF83F',
      customerEmail: 'test@test.com',
    })
    expect(link.url).toContain('mock')
    expect(link.reference).toContain('fotoman-case-123')
    expect(link.amountInCents).toBe(5000000)
  })
})

describe('getPaymentStatus', () => {
  it('returns APPROVED in mock mode', async () => {
    const result = await getPaymentStatus('mock-tx-123')
    expect(result.success).toBe(true)
    expect(result.status).toBe('APPROVED')
  })
})

describe('formatAmountCOP', () => {
  it('formats 5000000 cents as $50,000', () => {
    const formatted = formatAmountCOP(5000000)
    expect(formatted).toContain('50')
    expect(formatted).toContain('000')
  })

  it('formats 0 cents', () => {
    const formatted = formatAmountCOP(0)
    expect(formatted).toContain('0')
  })
})

describe('FOTOMULTA_FEE_COP_CENTS', () => {
  it('is $50,000 COP', () => {
    expect(FOTOMULTA_FEE_COP_CENTS).toBe(5000000)
  })
})
