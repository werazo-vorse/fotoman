export type { Fotomulta, FotomultaStatus, SimitResult } from './types.js'
export { lookupVerifik } from './verifik.js'
import { MOCK_DATA } from './mock-data.js'
import { getCached, writeCache } from './cache.js'
import { lookupVerifik } from './verifik.js'
import type { SimitResult } from './types.js'

export async function lookupFotomultas(
  plate: string,
  cedula?: string,
): Promise<SimitResult | null> {
  const normalized = plate.toUpperCase().trim()

  if (cedula && process.env.VERIFIK_TOKEN) {
    const trimmedCedula = cedula.trim()

    if (process.env.NODE_ENV !== 'production') {
      const cached = getCached(trimmedCedula)
      if (cached) return cached
    }

    try {
      const result = await lookupVerifik(trimmedCedula, process.env.VERIFIK_TOKEN)
      if (result) {
        if (process.env.NODE_ENV !== 'production') {
          writeCache(trimmedCedula, result)
        }
        return result
      }
    } catch (error) {
      console.warn('Verifik lookup failed, falling back to mock data:', error)
    }
  }

  return MOCK_DATA[normalized] ?? null
}
