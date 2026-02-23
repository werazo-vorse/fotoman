import { describe, expect, it } from 'vitest'
import { lookupFotomultas } from './index.js'

describe('lookupFotomultas', () => {
  it('returns data for known plate BYF83F', async () => {
    const result = await lookupFotomultas('BYF83F')
    expect(result).not.toBeNull()
    expect(result!.plate).toBe('BYF83F')
    expect(result!.fotomultas.length).toBeGreaterThan(0)
  })

  it('returns null for unknown plate', async () => {
    const result = await lookupFotomultas('ZZZ999')
    expect(result).toBeNull()
  })

  it('is case insensitive', async () => {
    const result = await lookupFotomultas('byf83f')
    expect(result).not.toBeNull()
    expect(result!.plate).toBe('BYF83F')
  })

  it('trims whitespace', async () => {
    const result = await lookupFotomultas('  BYF83F  ')
    expect(result).not.toBeNull()
  })

  it('all fotomultas have required fields', async () => {
    for (const plate of ['BYF83F', 'ABC123', 'XYZ789']) {
      const result = await lookupFotomultas(plate)
      expect(result).not.toBeNull()
      for (const f of result!.fotomultas) {
        expect(f.comparendoNumber).toBeTruthy()
        expect(f.infractionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(f.infractionCode).toBeTruthy()
        expect(f.amount).toBeGreaterThan(0)
        expect(f.plate).toBe(plate)
      }
    }
  })

  it('ABC123 has caducidad scenario (old infraction, no resolution)', async () => {
    const result = await lookupFotomultas('ABC123')
    const pending = result!.fotomultas.find((f) => f.status === 'pending')
    expect(pending).toBeDefined()
    expect(pending!.resolutionNumber).toBeNull()
    expect(pending!.resolutionDate).toBeNull()
  })

  it('ABC123 has prescripcion scenario (old resolution)', async () => {
    const result = await lookupFotomultas('ABC123')
    const old = result!.fotomultas.find((f) => f.resolutionDate === '2021-04-01')
    expect(old).toBeDefined()
  })
})
