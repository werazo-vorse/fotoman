import { describe, expect, it } from 'vitest'
import {
  buildSubmissionBody,
  buildSubmissionSubject,
  sendPetition,
} from './index.js'

describe('sendPetition', () => {
  it('returns success in mock mode (no API key)', async () => {
    const result = await sendPetition({
      toEmail: 'movilidad@cali.gov.co',
      ccEmail: 'user@test.com',
      subject: 'Test',
      bodyText: 'Test body',
      pdfBuffer: new Uint8Array([1, 2, 3]),
      pdfFilename: 'test.pdf',
      petitionerName: 'Test User',
    })
    expect(result.success).toBe(true)
    expect(result.messageId).toMatch(/^mock-/)
  })

  it('returns error for missing email', async () => {
    const result = await sendPetition({
      toEmail: '',
      ccEmail: 'user@test.com',
      subject: 'Test',
      bodyText: 'Test body',
      pdfBuffer: new Uint8Array([1, 2, 3]),
      pdfFilename: 'test.pdf',
      petitionerName: 'Test User',
    })
    expect(result.success).toBe(false)
    expect(result.error).toContain('required')
  })

  it('returns error for missing CC email', async () => {
    const result = await sendPetition({
      toEmail: 'movilidad@cali.gov.co',
      ccEmail: '',
      subject: 'Test',
      bodyText: 'Test body',
      pdfBuffer: new Uint8Array([1, 2, 3]),
      pdfFilename: 'test.pdf',
      petitionerName: 'Test User',
    })
    expect(result.success).toBe(false)
    expect(result.error).toContain('required')
  })
})

describe('buildSubmissionSubject', () => {
  it('formats single resolution', () => {
    const subject = buildSubmissionSubject(['0001887446'])
    expect(subject).toBe('Impugnación Resoluciones No. 0001887446 - Derecho de Petición')
  })

  it('formats multiple resolutions', () => {
    const subject = buildSubmissionSubject(['0001887446', '0001936615'])
    expect(subject).toBe(
      'Impugnación Resoluciones No. 0001887446 y No. 0001936615 - Derecho de Petición',
    )
  })
})

describe('buildSubmissionBody', () => {
  it('includes petitioner name and authority', () => {
    const body = buildSubmissionBody({
      petitionerName: 'DIANA ZUÑIGA',
      authority: 'SECRETARÍA DE MOVILIDAD DE CALI',
      resolutionNumbers: ['0001887446'],
    })
    expect(body).toContain('DIANA ZUÑIGA')
    expect(body).toContain('SECRETARÍA DE MOVILIDAD DE CALI')
    expect(body).toContain('No. 0001887446')
    expect(body).toContain('Ley 1755 de 2015')
  })
})
