import { describe, expect, it } from 'vitest'
import { FOTOMAN_TOOLS, createFotomanAgent } from './agent.js'
import { getSystemPrompt } from './system-prompt.js'

// Tool execute() returns T | AsyncIterable<T> in AI SDK v6.
// Our tools never yield, so we can safely cast to the direct return type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function exec(tool: { execute?: (...args: any[]) => any }, input: Record<string, unknown>) {
  return await tool.execute!(input, {} as never)
}

describe('FOTOMAN_TOOLS', () => {
  it('has all expected tools registered', () => {
    const toolNames = Object.keys(FOTOMAN_TOOLS)
    expect(toolNames).toContain('lookup_fotomultas')
    expect(toolNames).toContain('calculate_business_days')
    expect(toolNames).toContain('add_business_days')
    expect(toolNames).toContain('is_business_day')
    expect(toolNames).toContain('get_legal_reference')
    expect(toolNames).toContain('get_defense_strategy')
    expect(toolNames).toContain('list_all_defenses')
    expect(toolNames).toContain('validate_citation')
  })

  it('all tools have descriptions', () => {
    for (const [name, t] of Object.entries(FOTOMAN_TOOLS)) {
      expect(t.description, `Tool "${name}" missing description`).toBeTruthy()
    }
  })

  it('all tools have input schemas', () => {
    for (const [name, t] of Object.entries(FOTOMAN_TOOLS)) {
      expect(t.inputSchema, `Tool "${name}" missing inputSchema`).toBeDefined()
    }
  })
})

describe('system prompt', () => {
  const prompt = getSystemPrompt()

  it('is in Spanish', () => {
    expect(prompt).toContain('abogado colombiano')
    expect(prompt).toContain('fotomultas')
  })

  it('contains key legal references', () => {
    expect(prompt).toContain('Ley 1843')
    expect(prompt).toContain('C-038')
    expect(prompt).toContain('T-051')
  })

  it('contains scope limitation', () => {
    expect(prompt).toContain('Solo fotomultas')
  })

  it('contains all 5 defense strategies', () => {
    expect(prompt).toContain('Indebida Notificación')
    expect(prompt).toContain('Conductor No Identificado')
    expect(prompt).toContain('Caducidad')
    expect(prompt).toContain('Prescripción')
    expect(prompt).toContain('Vicios Técnicos')
  })

  it('contains PII protection rule', () => {
    expect(prompt).toContain('cédula')
  })
})

describe('tool execution', () => {
  it('lookup_fotomultas returns data for known plate', async () => {
    const result = await exec(FOTOMAN_TOOLS.lookup_fotomultas, { plate: 'BYF83F' })
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.fotomultaCount).toBeGreaterThan(0)
    }
  })

  it('lookup_fotomultas returns not found for unknown plate', async () => {
    const result = await exec(FOTOMAN_TOOLS.lookup_fotomultas, { plate: 'ZZZ999' })
    expect(result.found).toBe(false)
  })

  it('calculate_business_days returns correct count', async () => {
    const result = await exec(FOTOMAN_TOOLS.calculate_business_days, {
      from: '2026-01-05',
      to: '2026-01-09',
    })
    expect(result.businessDays).toBe(4)
    expect(result.exceeds13Days).toBe(false)
  })

  it('calculate_business_days detects >13 day violation', async () => {
    const result = await exec(FOTOMAN_TOOLS.calculate_business_days, {
      from: '2026-01-05',
      to: '2026-01-26',
    })
    expect(result.businessDays).toBeGreaterThan(13)
    expect(result.exceeds13Days).toBe(true)
  })

  it('add_business_days computes deadline', async () => {
    const result = await exec(FOTOMAN_TOOLS.add_business_days, {
      from: '2026-06-01',
      days: 13,
    })
    expect(result.resultDate).toBe('2026-06-22')
  })

  it('is_business_day checks correctly', async () => {
    const weekday = await exec(FOTOMAN_TOOLS.is_business_day, { date: '2026-02-24' })
    expect(weekday.isBusinessDay).toBe(true)

    const weekend = await exec(FOTOMAN_TOOLS.is_business_day, { date: '2026-02-28' })
    expect(weekend.isBusinessDay).toBe(false)
  })

  it('get_legal_reference returns known reference', async () => {
    const result = await exec(FOTOMAN_TOOLS.get_legal_reference, { key: 'ley-1843-2017-art8' })
    expect(result.found).toBe(true)
  })

  it('get_legal_reference returns not found for unknown', async () => {
    const result = await exec(FOTOMAN_TOOLS.get_legal_reference, { key: 'fake' })
    expect(result.found).toBe(false)
  })

  it('get_defense_strategy returns known strategy', async () => {
    const result = await exec(FOTOMAN_TOOLS.get_defense_strategy, {
      key: 'indebida-notificacion',
    })
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.requiredRefs.length).toBeGreaterThan(0)
    }
  })

  it('list_all_defenses returns 5 strategies', async () => {
    const result = await exec(FOTOMAN_TOOLS.list_all_defenses, {})
    expect(result.strategies).toHaveLength(5)
  })

  it('validate_citation validates known citation', async () => {
    const result = await exec(FOTOMAN_TOOLS.validate_citation, { citation: 'Ley 1843 de 2017' })
    expect(result.valid).toBe(true)
  })

  it('validate_citation rejects unknown citation', async () => {
    const result = await exec(FOTOMAN_TOOLS.validate_citation, { citation: 'Ley inventada' })
    expect(result.valid).toBe(false)
  })
})

describe('createFotomanAgent', () => {
  it('creates an agent with a chat method', () => {
    const mockModel = {} as never
    const agent = createFotomanAgent({ model: mockModel })
    expect(agent).toHaveProperty('chat')
    expect(typeof agent.chat).toBe('function')
  })
})
