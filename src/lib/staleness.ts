/**
 * Scores a single tab's staleness, 0 (fresh) - 100 (very stale).
 * Pure function — no chrome.* calls — so it's directly unit-testable
 * against synthetic tab + activity fixtures.
 */

import type { ActivityRecord } from './types'

const HOUR = 60 * 60 * 1000

/** Log-scale idle-time score: an hour vs a day should feel very different;
 * a week vs two weeks should feel similar. Caps at 90 so the "never
 * activated" penalty (below) can always push a tab to the very top. */
function idleScore(idleMs: number): number {
  if (idleMs <= 0) return 0
  const hours = idleMs / HOUR
  // log2(1 hour) = 0 -> score 0; log2(3 weeks ~ 500h) -> score ~90
  const score = (Math.log2(hours + 1) / Math.log2(500)) * 90
  return Math.min(90, Math.max(0, score))
}

export interface StalenessInput {
  tab: Pick<chrome.tabs.Tab, 'pinned' | 'audible' | 'lastAccessed'>
  activity: ActivityRecord | undefined
  now?: number
}

/** Pinned and audio-playing tabs are excluded from scoring entirely — a
 * hard rule, not a scoring input, so they never surface as close-candidates. */
export function isExemptFromStaleness(
  tab: Pick<chrome.tabs.Tab, 'pinned' | 'audible'>,
): boolean {
  return Boolean(tab.pinned) || Boolean(tab.audible)
}

export function scoreStaleness({
  tab,
  activity,
  now = Date.now(),
}: StalenessInput): number {
  if (isExemptFromStaleness(tab)) return 0

  const lastActive = tab.lastAccessed ?? activity?.lastActivated
  const neverActivated = !activity || activity.activatedCount === 0

  let score = lastActive !== undefined ? idleScore(now - lastActive) : 60 // unknown history -> assume moderately stale

  if (neverActivated) score = Math.min(100, score + 15)

  return Math.round(score)
}

export function stalenessLabel(
  score: number,
): 'fresh' | 'idle' | 'stale' | 'very-stale' {
  if (score < 20) return 'fresh'
  if (score < 45) return 'idle'
  if (score < 75) return 'stale'
  return 'very-stale'
}

/** Cluster-level staleness = mean of its tabs' scores. */
export function averageStaleness(scores: number[]): number {
  if (scores.length === 0) return 0
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}
