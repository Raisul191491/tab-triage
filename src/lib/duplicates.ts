/**
 * Flags tabs with identical or near-identical URLs — independent of topic
 * clustering, since "this exact page is open 4 times" is an unambiguous
 * close-candidate regardless of staleness.
 */

import type { DuplicateGroup } from './types'

/** Params that are pure tracking noise and safe to ignore for comparison. */
const NOISE_PARAM_PREFIXES = ['utm_', 'fbclid', 'gclid', 'ref', 'igshid']

export function normalizeUrl(rawUrl: string): string {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return rawUrl
  }
  const params = new URLSearchParams(url.search)
  for (const key of [...params.keys()]) {
    if (NOISE_PARAM_PREFIXES.some((p) => key.toLowerCase().startsWith(p))) {
      params.delete(key)
    }
  }
  const search = params.toString()
  // Drop fragment — same page, different scroll anchor is not a duplicate
  // worth surfacing separately, but do keep it for SPA routes that use
  // fragments for actual navigation... except we can't tell the difference
  // generically, so favor the common case (fragment = anchor) and ignore it.
  return `${url.origin}${url.pathname}${search ? `?${search}` : ''}`
}

export function findDuplicates(tabs: { id: number; url: string }[]): DuplicateGroup[] {
  const byNormalized = new Map<string, number[]>()
  for (const tab of tabs) {
    if (!tab.url) continue
    const normalized = normalizeUrl(tab.url)
    const list = byNormalized.get(normalized) ?? []
    list.push(tab.id)
    byNormalized.set(normalized, list)
  }

  const groups: DuplicateGroup[] = []
  for (const [normalizedUrl, tabIds] of byNormalized) {
    if (tabIds.length > 1) {
      groups.push({ id: `dup:${normalizedUrl}`, normalizedUrl, tabIds })
    }
  }
  return groups
}
