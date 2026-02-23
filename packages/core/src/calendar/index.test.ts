import { describe, expect, it } from 'vitest'
import {
  addBusinessDays,
  businessDaysBetween,
  getHolidays,
  isBusinessDay,
} from './index.js'

function d(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year!, month! - 1, day!))
}

describe('getHolidays', () => {
  it('returns exactly 18 holidays for 2026', () => {
    expect(getHolidays(2026)).toHaveLength(18)
  })

  it('returns exactly 18 holidays for 2025', () => {
    expect(getHolidays(2025)).toHaveLength(18)
  })

  it('returns holidays with correct shape', () => {
    const holidays = getHolidays(2026)
    for (const h of holidays) {
      expect(h).toHaveProperty('date')
      expect(h).toHaveProperty('celebrationDate')
      expect(h).toHaveProperty('name')
      expect(h.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(h.celebrationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('2026 holidays match official calendar', () => {
    const holidays = getHolidays(2026)
    const dates = holidays.map((h) => h.celebrationDate)

    const expected2026 = [
      '2026-01-01', // Año Nuevo
      '2026-01-12', // Reyes Magos (6→Mon 12)
      '2026-03-23', // San José (19→Mon 23)
      '2026-04-02', // Jueves Santo
      '2026-04-03', // Viernes Santo
      '2026-05-01', // Día del Trabajo
      '2026-05-18', // Ascensión del Señor (Easter+43→Mon)
      '2026-06-08', // Corpus Christi (Easter+64)
      '2026-06-15', // Sagrado Corazón (Easter+71)
      '2026-06-29', // San Pedro y San Pablo (29→Mon 29, already Mon)
      '2026-07-20', // Independencia
      '2026-08-07', // Batalla de Boyacá
      '2026-08-17', // Asunción (15→Mon 17)
      '2026-10-12', // Día de la Raza (12→Mon 12, already Mon)
      '2026-11-02', // Todos los Santos (1→Mon 2)
      '2026-11-16', // Independencia de Cartagena (11→Mon 16)
      '2026-12-08', // Inmaculada Concepción
      '2026-12-25', // Navidad
    ]

    expect(dates).toEqual(expected2026)
  })
})

describe('isBusinessDay', () => {
  it('returns false for Saturday', () => {
    expect(isBusinessDay(d('2026-02-28'))).toBe(false)
  })

  it('returns false for Sunday', () => {
    expect(isBusinessDay(d('2026-03-01'))).toBe(false)
  })

  it('returns true for a regular weekday', () => {
    expect(isBusinessDay(d('2026-02-24'))).toBe(true) // Tuesday
  })

  it('returns false for a fixed holiday (Año Nuevo)', () => {
    expect(isBusinessDay(d('2026-01-01'))).toBe(false)
  })

  it('returns false for an Emiliani-shifted holiday (Reyes Magos)', () => {
    expect(isBusinessDay(d('2026-01-12'))).toBe(false) // shifted from Jan 6
  })

  it('returns true for the original date of a shifted holiday', () => {
    expect(isBusinessDay(d('2026-01-06'))).toBe(true) // Tuesday, not the celebration date
  })

  it('returns false for Jueves Santo', () => {
    expect(isBusinessDay(d('2026-04-02'))).toBe(false)
  })

  it('returns false for Viernes Santo', () => {
    expect(isBusinessDay(d('2026-04-03'))).toBe(false)
  })

  it('returns false for Christmas', () => {
    expect(isBusinessDay(d('2026-12-25'))).toBe(false)
  })
})

describe('businessDaysBetween', () => {
  it('counts business days in a simple week (Mon to Fri)', () => {
    // Mon Jan 5 to Fri Jan 9: Tue, Wed, Thu, Fri = 4
    expect(businessDaysBetween(d('2026-01-05'), d('2026-01-09'))).toBe(4)
  })

  it('skips holidays (year boundary with Jan 1)', () => {
    // Wed Dec 31 to Fri Jan 2: Jan 1 is holiday, only Jan 2 counts
    expect(businessDaysBetween(d('2025-12-31'), d('2026-01-02'))).toBe(1)
  })

  it('handles year boundary with multiple holidays and weekends', () => {
    // Dec 24 (Wed) to Jan 5 (Mon)
    // Dec 25 = holiday, Dec 26 = Fri (workday), Dec 27-28 = weekend
    // Dec 29 = Mon (workday), Dec 30 = Tue (workday), Dec 31 = Wed (workday)
    // Jan 1 = holiday, Jan 2 = Fri (workday), Jan 3-4 = weekend, Jan 5 = Mon (workday)
    expect(businessDaysBetween(d('2025-12-24'), d('2026-01-05'))).toBe(6)
  })

  it('returns negative when to < from', () => {
    expect(businessDaysBetween(d('2026-01-09'), d('2026-01-05'))).toBe(-4)
  })

  it('returns 0 for same date', () => {
    expect(businessDaysBetween(d('2026-03-02'), d('2026-03-02'))).toBe(0)
  })

  it('returns 0 from Fri to Sat (weekend)', () => {
    expect(businessDaysBetween(d('2026-01-09'), d('2026-01-10'))).toBe(0)
  })

  it('returns 1 from Fri to Mon (only Mon counted)', () => {
    expect(businessDaysBetween(d('2026-01-09'), d('2026-01-12'))).toBe(0)
    // Wait -- Jan 12 2026 is Reyes Magos (holiday). So 0 business days.
  })

  it('handles Semana Santa correctly', () => {
    // 2026 Easter: April 5. Jueves Santo = Apr 2, Viernes Santo = Apr 3
    // Mon Mar 30 to Fri Apr 3:
    // Mar 31 (Tue), Apr 1 (Wed), Apr 2 (Jueves Santo=holiday), Apr 3 (Viernes Santo=holiday)
    // = 2 business days
    expect(businessDaysBetween(d('2026-03-30'), d('2026-04-03'))).toBe(2)
  })

  it('counts 13 business days for notification rule', () => {
    // From Jun 1 (Mon) 2026, count 13 business days forward
    // Jun holidays in 2026: Jun 8 (Corpus Christi), Jun 15 (Sagrado Corazón), Jun 29 (San Pedro)
    // Jun 2(T), 3(W), 4(T), 5(F), [6-7 weekend], 9(T), 10(W), 11(T), 12(F), [13-14 weekend]
    // 16(T), 17(W), 18(T)
    // Wait -- Jun 8 is Mon (Corpus Christi=holiday), Jun 15 is Mon (Sagrado Corazón=holiday)
    // Jun 2(1), 3(2), 4(3), 5(4), [wk], 8=holiday, 9(5), 10(6), 11(7), 12(8), [wk], 15=holiday, 16(9), 17(10), 18(11), 19(12), [wk], 22(13)
    expect(businessDaysBetween(d('2026-06-01'), d('2026-06-22'))).toBe(13)
  })
})

describe('addBusinessDays', () => {
  it('adds 0 business days returns same date', () => {
    const date = d('2026-03-02')
    expect(addBusinessDays(date, 0)).toEqual(date)
  })

  it('adds 1 business day from Monday', () => {
    expect(addBusinessDays(d('2026-01-05'), 1)).toEqual(d('2026-01-06'))
  })

  it('adds 5 business days skipping Semana Santa', () => {
    // From Mon Mar 30, add 5 business days
    // Mar 31(1), Apr 1(2), Apr 2=Jueves Santo(skip), Apr 3=Viernes Santo(skip)
    // Apr 4-5=weekend, Apr 6(3), Apr 7(4), Apr 8(5)
    expect(addBusinessDays(d('2026-03-30'), 5)).toEqual(d('2026-04-08'))
  })

  it('adds 13 business days for notification deadline', () => {
    expect(addBusinessDays(d('2026-06-01'), 13)).toEqual(d('2026-06-22'))
  })

  it('skips Reyes Magos on Jan 12', () => {
    // From Fri Jan 9, add 1 business day
    // Jan 10-11 = weekend, Jan 12 = Reyes Magos (holiday), Jan 13 = Tue
    expect(addBusinessDays(d('2026-01-09'), 1)).toEqual(d('2026-01-13'))
  })

  it('subtracts business days (negative)', () => {
    // From Fri Jan 16, subtract 5 business days
    // Jan 15(1), Jan 14(2), Jan 13(3), Jan 12=Reyes Magos(skip), Jan 11=Sun(skip), Jan 10=Sat(skip), Jan 9(4), Jan 8(5)
    expect(addBusinessDays(d('2026-01-16'), -5)).toEqual(d('2026-01-08'))
  })

  it('handles adding from a weekend', () => {
    // From Saturday Jan 10, add 1 business day → Monday Jan 12 is holiday → Tuesday Jan 13
    expect(addBusinessDays(d('2026-01-10'), 1)).toEqual(d('2026-01-13'))
  })

  it('handles adding from a holiday', () => {
    // From Jan 1 (holiday), add 1 business day → Jan 2 (Fri)
    expect(addBusinessDays(d('2026-01-01'), 1)).toEqual(d('2026-01-02'))
  })
})
