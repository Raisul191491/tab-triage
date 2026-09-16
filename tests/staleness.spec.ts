import { describe, expect, it } from 'vitest'
import {
  averageStaleness,
  isExemptFromStaleness,
  scoreStaleness,
  stalenessLabel,
} from '../src/lib/staleness'
import type { ActivityRecord } from '../src/lib/types'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const NOW = Date.now()

function activity(overrides: Partial<ActivityRecord> = {}): ActivityRecord {
  return {
    tabId: 1,
    url: 'https://example.com',
    firstSeen: NOW - DAY,
    lastActivated: NOW - HOUR,
    activatedCount: 1,
    ...overrides,
  }
}

describe('isExemptFromStaleness', () => {
  it('exempts pinned tabs', () => {
    expect(isExemptFromStaleness({ pinned: true, audible: false })).toBe(true)
  })
  it('exempts audible tabs', () => {
    expect(isExemptFromStaleness({ pinned: false, audible: true })).toBe(true)
  })
  it('does not exempt ordinary tabs', () => {
    expect(isExemptFromStaleness({ pinned: false, audible: false })).toBe(false)
  })
})

describe('scoreStaleness', () => {
  it('scores a pinned tab as 0 regardless of idle time', () => {
    const score = scoreStaleness({
      tab: { pinned: true, audible: false, lastAccessed: NOW - 30 * DAY },
      activity: activity(),
      now: NOW,
    })
    expect(score).toBe(0)
  })

  it('scores an audible tab as 0 regardless of idle time', () => {
    const score = scoreStaleness({
      tab: { pinned: false, audible: true, lastAccessed: NOW - 30 * DAY },
      activity: activity(),
      now: NOW,
    })
    expect(score).toBe(0)
  })

  it('a recently active tab scores low', () => {
    const score = scoreStaleness({
      tab: { pinned: false, audible: false, lastAccessed: NOW - 5 * 60 * 1000 },
      activity: activity({ activatedCount: 3 }),
      now: NOW,
    })
    expect(score).toBeLessThan(20)
  })

  it('a tab idle for weeks scores high', () => {
    const score = scoreStaleness({
      tab: { pinned: false, audible: false, lastAccessed: NOW - 21 * DAY },
      activity: activity({ activatedCount: 3, lastActivated: NOW - 21 * DAY }),
      now: NOW,
    })
    expect(score).toBeGreaterThan(75)
  })

  it('a never-activated tab scores higher than an equally idle activated one', () => {
    const idleTime = NOW - 2 * DAY
    const neverActivated = scoreStaleness({
      tab: { pinned: false, audible: false, lastAccessed: idleTime },
      activity: activity({ activatedCount: 0, lastActivated: idleTime }),
      now: NOW,
    })
    const activated = scoreStaleness({
      tab: { pinned: false, audible: false, lastAccessed: idleTime },
      activity: activity({ activatedCount: 2, lastActivated: idleTime }),
      now: NOW,
    })
    expect(neverActivated).toBeGreaterThan(activated)
  })

  it('caps at 100', () => {
    const score = scoreStaleness({
      tab: { pinned: false, audible: false, lastAccessed: NOW - 365 * DAY },
      activity: activity({ activatedCount: 0 }),
      now: NOW,
    })
    expect(score).toBeLessThanOrEqual(100)
  })
})

describe('stalenessLabel', () => {
  it('buckets scores correctly', () => {
    expect(stalenessLabel(0)).toBe('fresh')
    expect(stalenessLabel(30)).toBe('idle')
    expect(stalenessLabel(60)).toBe('stale')
    expect(stalenessLabel(90)).toBe('very-stale')
  })
})

describe('averageStaleness', () => {
  it('averages scores', () => {
    expect(averageStaleness([10, 20, 30])).toBe(20)
  })
  it('returns 0 for an empty list', () => {
    expect(averageStaleness([])).toBe(0)
  })
})
