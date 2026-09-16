/** Typed wrapper around chrome.storage.local for extension settings. */

export interface Settings {
  version: 1
  titleOverlapThreshold: number
  staleThresholdBadgeCount: number
}

export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  titleOverlapThreshold: 0.4,
  staleThresholdBadgeCount: 40,
}

const STORAGE_KEY = 'tt:settings'

export async function getSettings(): Promise<Settings> {
  const stored = await chrome.storage.local.get(STORAGE_KEY)
  return { ...DEFAULT_SETTINGS, ...(stored[STORAGE_KEY] as Partial<Settings>) }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: settings })
}
