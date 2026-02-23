export type { Fotomulta, FotomultaStatus, SimitResult } from './types.js'
import { MOCK_DATA } from './mock-data.js'
import type { SimitResult } from './types.js'

export async function lookupFotomultas(plate: string): Promise<SimitResult | null> {
  const normalized = plate.toUpperCase().trim()
  return MOCK_DATA[normalized] ?? null
}
