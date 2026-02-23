import { getHolidaysForYear } from 'colombian-holidays'

export interface ColombianHoliday {
  date: string
  celebrationDate: string
  name: string
}

const holidayCache = new Map<number, ColombianHoliday[]>()
const holidaySetCache = new Map<number, Set<string>>()

export function getHolidays(year: number): ColombianHoliday[] {
  const cached = holidayCache.get(year)
  if (cached) return cached

  const raw = getHolidaysForYear(year)
  const holidays: ColombianHoliday[] = raw.map((h) => ({
    date: h.date,
    celebrationDate: h.celebrationDate,
    name: h.name.es,
  }))

  holidayCache.set(year, holidays)
  return holidays
}

function getHolidaySet(year: number): Set<string> {
  const cached = holidaySetCache.get(year)
  if (cached) return cached

  const holidays = getHolidays(year)
  const set = new Set(holidays.map((h) => h.celebrationDate))
  holidaySetCache.set(year, set)
  return set
}

function toUTCMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function toISODate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay()
  return day === 0 || day === 6
}

function isHolidayDate(date: Date): boolean {
  const iso = toISODate(date)
  const year = date.getUTCFullYear()
  return getHolidaySet(year).has(iso)
}

export function isBusinessDay(date: Date): boolean {
  const d = toUTCMidnight(date)
  return !isWeekend(d) && !isHolidayDate(d)
}

function addDays(date: Date, days: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days))
}

export function businessDaysBetween(from: Date, to: Date): number {
  const start = toUTCMidnight(from)
  const end = toUTCMidnight(to)

  if (start.getTime() === end.getTime()) return 0

  const forward = end.getTime() > start.getTime()
  const step = forward ? 1 : -1
  let count = 0
  let current = addDays(start, step)

  while (forward ? current.getTime() <= end.getTime() : current.getTime() >= end.getTime()) {
    if (isBusinessDay(current)) {
      count += step
    }
    current = addDays(current, step)
  }

  return count
}

export function addBusinessDays(from: Date, days: number): Date {
  const start = toUTCMidnight(from)
  if (days === 0) return start

  const step = days > 0 ? 1 : -1
  let remaining = Math.abs(days)
  let current = start

  while (remaining > 0) {
    current = addDays(current, step)
    if (isBusinessDay(current)) {
      remaining--
    }
  }

  return current
}
