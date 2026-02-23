import { describe, expect, it } from 'vitest'
import {
  getAllReferences,
  getAllStrategies,
  getDefenseStrategy,
  getLegalReference,
  validateCitation,
} from './index.js'

describe('getLegalReference', () => {
  it('returns Ley 1843 Art 8 for known key', () => {
    const ref = getLegalReference('ley-1843-2017-art8')
    expect(ref).toBeDefined()
    expect(ref!.citation).toBe('Artículo 8, Ley 1843 de 2017')
    expect(ref!.type).toBe('ley')
  })

  it('returns Sentencia C-038 for known key', () => {
    const ref = getLegalReference('sentencia-c038-2020')
    expect(ref).toBeDefined()
    expect(ref!.type).toBe('sentencia')
  })

  it('returns undefined for unknown key', () => {
    expect(getLegalReference('fake-key')).toBeUndefined()
  })
})

describe('getAllReferences', () => {
  it('returns at least 7 references', () => {
    expect(getAllReferences().length).toBeGreaterThanOrEqual(7)
  })

  it('all references have required fields', () => {
    for (const ref of getAllReferences()) {
      expect(ref.key).toBeTruthy()
      expect(ref.citation).toBeTruthy()
      expect(ref.fullText).toBeTruthy()
      expect(ref.type).toBeTruthy()
      expect(ref.shortName).toBeTruthy()
      expect(ref.summary).toBeTruthy()
    }
  })

  it('returns a copy (not mutable)', () => {
    const a = getAllReferences()
    const b = getAllReferences()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })
})

describe('getDefenseStrategy', () => {
  it('returns indebida-notificacion strategy', () => {
    const s = getDefenseStrategy('indebida-notificacion')
    expect(s).toBeDefined()
    expect(s!.name).toBe('Indebida Notificación')
    expect(s!.requiredRefs.length).toBeGreaterThan(0)
  })

  it('returns conductor-no-identificado strategy', () => {
    const s = getDefenseStrategy('conductor-no-identificado')
    expect(s).toBeDefined()
    expect(s!.requiredRefs).toContain('sentencia-c038-2020')
  })
})

describe('getAllStrategies', () => {
  it('returns exactly 5 strategies', () => {
    expect(getAllStrategies()).toHaveLength(5)
  })

  it('all strategy requiredRefs resolve to existing references', () => {
    for (const strategy of getAllStrategies()) {
      for (const refKey of strategy.requiredRefs) {
        const ref = getLegalReference(refKey)
        expect(ref, `Strategy "${strategy.key}" references unknown key "${refKey}"`).toBeDefined()
      }
    }
  })
})

describe('validateCitation', () => {
  it('matches exact citation text', () => {
    const result = validateCitation('Artículo 8, Ley 1843 de 2017')
    expect(result).not.toBeNull()
    expect(result!.key).toBe('ley-1843-2017-art8')
  })

  it('matches Ley 1843 de 2017 alias', () => {
    const result = validateCitation('Ley 1843 de 2017')
    expect(result).not.toBeNull()
    expect(result!.key).toBe('ley-1843-2017-art8')
  })

  it('matches Sentencia C-038 de 2020', () => {
    const result = validateCitation('Sentencia C-038 de 2020')
    expect(result).not.toBeNull()
    expect(result!.key).toBe('sentencia-c038-2020')
  })

  it('matches Sentencia C038 without hyphen', () => {
    const result = validateCitation('Sentencia C038 de 2020')
    expect(result).not.toBeNull()
    expect(result!.key).toBe('sentencia-c038-2020')
  })

  it('matches case insensitive', () => {
    const result = validateCitation('ley 1843 de 2017')
    expect(result).not.toBeNull()
  })

  it('matches CPACA alias', () => {
    const result = validateCitation('CPACA')
    expect(result).not.toBeNull()
    expect(result!.key).toBe('cpaca-notificacion')
  })

  it('returns null for unknown citation', () => {
    expect(validateCitation('Ley imaginaria de 3000')).toBeNull()
  })

  it('matches Resolución 718 de 2018', () => {
    const result = validateCitation('Resolución 718 de 2018')
    expect(result).not.toBeNull()
    expect(result!.key).toBe('resolucion-718-2018')
  })

  it('matches Sentencia T-051 de 2016', () => {
    const result = validateCitation('Sentencia T-051 de 2016')
    expect(result).not.toBeNull()
    expect(result!.key).toBe('sentencia-t051-2016')
  })
})
