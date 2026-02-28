export type { LegalReference, DefenseKey, DefenseStrategy, ReferenceType } from './types.js'
import { LEGAL_REFERENCES } from './references.js'
import { DEFENSE_STRATEGIES } from './strategies.js'
import type { DefenseKey, DefenseStrategy, LegalReference } from './types.js'

const refsByKey = new Map<string, LegalReference>(LEGAL_REFERENCES.map((r) => [r.key, r]))

const strategiesByKey = new Map<DefenseKey, DefenseStrategy>(
  DEFENSE_STRATEGIES.map((s) => [s.key, s]),
)

export function getLegalReference(key: string): LegalReference | undefined {
  return refsByKey.get(key)
}

export function getAllReferences(): LegalReference[] {
  return [...LEGAL_REFERENCES]
}

export function getDefenseStrategy(key: DefenseKey): DefenseStrategy | undefined {
  return strategiesByKey.get(key)
}

export function getAllStrategies(): DefenseStrategy[] {
  return [...DEFENSE_STRATEGIES]
}

const citationPatterns: Array<{ pattern: RegExp; key: string }> = LEGAL_REFERENCES.map((ref) => ({
  pattern: new RegExp(escapeRegex(ref.citation), 'i'),
  key: ref.key,
}))

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const CITATION_ALIASES: Array<{ pattern: RegExp; key: string }> = [
  { pattern: /ley\s*1843\s*(de\s*)?2017/i, key: 'ley-1843-2017-art8' },
  { pattern: /ley\s*1755\s*(de\s*)?2015/i, key: 'ley-1755-2015' },
  { pattern: /sentencia\s*c[- ]?038\s*(de\s*)?2020/i, key: 'sentencia-c038-2020' },
  { pattern: /sentencia\s*c[- ]?321\s*(de\s*)?2022/i, key: 'sentencia-c321-2022' },
  { pattern: /sentencia\s*t[- ]?051\s*(de\s*)?2016/i, key: 'sentencia-t051-2016' },
  { pattern: /sentencia\s*c[- ]?957\s*(de\s*)?1999/i, key: 'sentencia-c957-1999' },
  { pattern: /art[ií]culo\s*29.*constituci[oó]n/i, key: 'constitucion-art29' },
  { pattern: /art[ií]culo\s*23.*constituci[oó]n/i, key: 'constitucion-art23' },
  { pattern: /art[ií]culo\s*74.*constituci[oó]n/i, key: 'constitucion-art74' },
  { pattern: /art[ií]culo\s*86.*constituci[oó]n/i, key: 'constitucion-art86' },
  { pattern: /art[ií]culo\s*161.*c[oó]digo.*tr[aá]nsito/i, key: 'cnt-art161' },
  { pattern: /art[ií]culo\s*159.*ley\s*769/i, key: 'cnt-art159' },
  { pattern: /art[ií]culo\s*135.*c[oó]digo.*tr[aá]nsito/i, key: 'cnt-art135' },
  { pattern: /art[ií]culo\s*52.*ley\s*1437/i, key: 'ley-1437-2011-art52' },
  { pattern: /art[ií]culo\s*14.*ley\s*1755/i, key: 'ley-1755-2015-art14' },
  { pattern: /art[ií]culo\s*826.*estatuto/i, key: 'estatuto-tributario-art826' },
  { pattern: /resoluci[oó]n\s*718\s*(de\s*)?2018/i, key: 'resolucion-718-2018' },
  { pattern: /ley\s*962\s*(de\s*)?2005/i, key: 'ley-962-2005' },
  { pattern: /cpaca/i, key: 'cpaca-notificacion' },
]

export function validateCitation(text: string): LegalReference | null {
  for (const { pattern, key } of citationPatterns) {
    if (pattern.test(text)) {
      return refsByKey.get(key) ?? null
    }
  }

  for (const { pattern, key } of CITATION_ALIASES) {
    if (pattern.test(text)) {
      return refsByKey.get(key) ?? null
    }
  }

  return null
}
