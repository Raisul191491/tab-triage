/**
 * Typed wrapper around chrome.storage.local for per-tab activity history.
 * MV3 service workers are ephemeral — this is what makes staleness scoring
 * survive a worker restart instead of resetting to "everything is fresh."
 */

import type { ActivityRecord } from './types'

const STORAGE_KEY = 'tt:activity'

type ActivityMap = Record<number, ActivityRecord>

async function readAll(): Promise<ActivityMap> {
  const stored = await chrome.storage.local.get(STORAGE_KEY)
  return (stored[STORAGE_KEY] as ActivityMap) ?? {}
}

async function writeAll(map: ActivityMap): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: map })
}

export async function recordCreated(tabId: number, url: string): Promise<void> {
  const map = await readAll()
  if (map[tabId]) return
  const now = Date.now()
  map[tabId] = { tabId, url, firstSeen: now, lastActivated: now, activatedCount: 0 }
  await writeAll(map)
}

export async function recordActivated(tabId: number, url: string): Promise<void> {
  const map = await readAll()
  const now = Date.now()
  const existing = map[tabId]
  map[tabId] = existing
    ? {
        ...existing,
        url,
        lastActivated: now,
        activatedCount: existing.activatedCount + 1,
      }
    : { tabId, url, firstSeen: now, lastActivated: now, activatedCount: 1 }
  await writeAll(map)
}

export async function getActivity(tabId: number): Promise<ActivityRecord | undefined> {
  return (await readAll())[tabId]
}

export async function getAllActivity(): Promise<ActivityMap> {
  return readAll()
}

/** Drop records for tabs that no longer exist. Run on a periodic alarm. */
export async function pruneClosed(openTabIds: Set<number>): Promise<void> {
  const map = await readAll()
  let changed = false
  for (const tabId of Object.keys(map).map(Number)) {
    if (!openTabIds.has(tabId)) {
      delete map[tabId]
      changed = true
    }
  }
  if (changed) await writeAll(map)
}
