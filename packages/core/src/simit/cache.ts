import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { SimitResult } from './types.js'

interface CacheEntry {
  result: SimitResult
  cachedAt: string
}

type SimitCache = Record<string, CacheEntry>

const CACHE_PATH = resolve(process.cwd(), '.simit-cache.json')

function readCache(): SimitCache {
  try {
    const raw = readFileSync(CACHE_PATH, 'utf-8')
    return JSON.parse(raw) as SimitCache
  } catch {
    return {}
  }
}

export function getCached(cedula: string): SimitResult | null {
  const cache = readCache()
  return cache[cedula]?.result ?? null
}

export function writeCache(cedula: string, result: SimitResult): void {
  const cache = readCache()
  cache[cedula] = { result, cachedAt: new Date().toISOString() }
  try {
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8')
  } catch (error) {
    console.warn('Failed to write SIMIT cache:', error)
  }
}
