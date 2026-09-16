/**
 * Groups tabs into clusters purely by registrable domain — e.g. every
 * docs.google.com and github.com tab lands in its own single cluster,
 * regardless of title. Pure function — no chrome.* calls — takes
 * already-fetched tab data plus staleness scores, so it's directly
 * unit-testable.
 */

import type { Cluster } from './types'
import { averageStaleness } from './staleness'

export function registrableDomain(rawUrl: string): string {
  try {
    const { hostname } = new URL(rawUrl)
    const parts = hostname.split('.')
    return parts.length <= 2 ? hostname : parts.slice(-2).join('.')
  } catch {
    return rawUrl
  }
}

export interface ClusterableTab {
  id: number
  url: string
  title: string
  stalenessScore: number
}

export function buildClusters(tabs: ClusterableTab[]): Cluster[] {
  const byDomain = new Map<string, ClusterableTab[]>()
  for (const tab of tabs) {
    if (!tab.url) continue
    const domain = registrableDomain(tab.url)
    const list = byDomain.get(domain) ?? []
    list.push(tab)
    byDomain.set(domain, list)
  }

  const clusters: Cluster[] = []
  for (const [domain, domainTabs] of byDomain) {
    clusters.push({
      id: `cluster:${domain}`,
      label: domain,
      domain,
      tabIds: domainTabs.map((t) => t.id),
      stalenessScore: averageStaleness(domainTabs.map((t) => t.stalenessScore)),
    })
  }

  return clusters.sort((a, b) => b.stalenessScore - a.stalenessScore)
}
