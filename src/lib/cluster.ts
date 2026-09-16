/**
 * Groups tabs into clusters, cheapest signal first:
 *   1. registrable domain
 *   2. title-token overlap within a domain (Jaccard similarity)
 *
 * Pure function — no chrome.* calls — takes already-fetched tab data plus
 * the activity log's staleness scores, so it's directly unit-testable.
 */

import type { Cluster } from './types'
import { averageStaleness } from './staleness'

const TITLE_OVERLAP_THRESHOLD = 0.4

/** Common per-site title suffixes that would otherwise dominate token
 * overlap and make every tab on a domain look "similar." */
const SUFFIX_PATTERN = /\s*[-–|]\s*[^-–|]{1,40}$/

function tokenize(title: string): Set<string> {
  const stripped = title.replace(SUFFIX_PATTERN, '')
  const tokens = stripped
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2)
  return new Set(tokens)
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const token of a) if (b.has(token)) intersection++
  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

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
    const tokensById = new Map(domainTabs.map((t) => [t.id, tokenize(t.title)]))
    // Greedy single-link grouping: each tab joins the first existing
    // sub-cluster whose seed tab's tokens overlap enough, else starts a new one.
    const subClusters: ClusterableTab[][] = []
    for (const tab of domainTabs) {
      const tabTokens = tokensById.get(tab.id)!
      const match = subClusters.find((group) => {
        const seedTokens = tokensById.get(group[0]!.id)!
        return jaccard(tabTokens, seedTokens) >= TITLE_OVERLAP_THRESHOLD
      })
      if (match) match.push(tab)
      else subClusters.push([tab])
    }

    for (const group of subClusters) {
      const label =
        subClusters.length === 1
          ? domain
          : `${domain} — ${group[0]!.title.replace(SUFFIX_PATTERN, '').slice(0, 40)}`
      clusters.push({
        id: `cluster:${domain}:${group[0]!.id}`,
        label,
        domain,
        tabIds: group.map((t) => t.id),
        stalenessScore: averageStaleness(group.map((t) => t.stalenessScore)),
      })
    }
  }

  return clusters.sort((a, b) => b.stalenessScore - a.stalenessScore)
}
