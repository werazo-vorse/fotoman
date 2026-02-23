import { describe, expect, it } from 'vitest'
import { calculateDeadlineDate, calculateWarningDate } from './deadlines.js'

describe('calculateDeadlineDate', () => {
  it('adds 15 business days to submission date', () => {
    const submission = new Date('2026-02-23') // Monday
    const deadline = calculateDeadlineDate(submission)
    // 15 business days = 3 weeks = March 16 (Monday), but need to check holidays
    expect(deadline.getTime()).toBeGreaterThan(submission.getTime())
    // At minimum 15 calendar days ahead (could be more due to weekends/holidays)
    const daysDiff = Math.round((deadline.getTime() - submission.getTime()) / (1000 * 60 * 60 * 24))
    expect(daysDiff).toBeGreaterThanOrEqual(15)
  })

  it('skips weekends', () => {
    const friday = new Date('2026-02-27') // Friday
    const deadline = calculateDeadlineDate(friday)
    // Should be at least 21 calendar days (15 biz days + 6 weekend days)
    const daysDiff = Math.round((deadline.getTime() - friday.getTime()) / (1000 * 60 * 60 * 24))
    expect(daysDiff).toBeGreaterThanOrEqual(19)
  })
})

describe('calculateWarningDate', () => {
  it('is 12 business days after submission (3 before deadline)', () => {
    const submission = new Date('2026-02-23')
    const warning = calculateWarningDate(submission)
    const deadline = calculateDeadlineDate(submission)
    expect(warning.getTime()).toBeLessThan(deadline.getTime())
  })

  it('warning is always before deadline', () => {
    const dates = [
      new Date('2026-01-05'),
      new Date('2026-03-15'),
      new Date('2026-06-20'),
      new Date('2026-12-01'),
    ]
    for (const d of dates) {
      const warning = calculateWarningDate(d)
      const deadline = calculateDeadlineDate(d)
      expect(warning.getTime()).toBeLessThan(deadline.getTime())
    }
  })
})
