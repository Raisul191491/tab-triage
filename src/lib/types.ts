export interface Cluster {
  id: string
  label: string
  domain: string
  tabIds: number[]
  stalenessScore: number
}

export interface DuplicateGroup {
  id: string
  normalizedUrl: string
  tabIds: number[]
}

/** One record per tab the background worker has observed this browser session. */
export interface ActivityRecord {
  tabId: number
  url: string
  firstSeen: number
  lastActivated: number
  activatedCount: number
}
