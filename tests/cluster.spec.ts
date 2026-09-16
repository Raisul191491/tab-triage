import { describe, expect, it } from 'vitest'
import { buildClusters, registrableDomain } from '../src/lib/cluster'
import type { ClusterableTab } from '../src/lib/cluster'

function tab(
  id: number,
  url: string,
  title: string,
  stalenessScore = 0,
): ClusterableTab {
  return { id, url, title, stalenessScore }
}

describe('registrableDomain', () => {
  it('extracts the registrable domain', () => {
    expect(registrableDomain('https://docs.google.com/document/1')).toBe('google.com')
    expect(registrableDomain('https://github.com/foo/bar')).toBe('github.com')
  })

  it('falls back to the raw string on an invalid URL', () => {
    expect(registrableDomain('not-a-url')).toBe('not-a-url')
  })
})

describe('buildClusters', () => {
  it('groups tabs on the same domain with similar titles', () => {
    const clusters = buildClusters([
      tab(1, 'https://github.com/a/repo/issues/1', 'Bug: crash on load - repo'),
      tab(2, 'https://github.com/a/repo/issues/2', 'Bug: crash on save - repo'),
    ])
    expect(clusters).toHaveLength(1)
    expect(clusters[0]!.tabIds.sort()).toEqual([1, 2])
  })

  it('splits a domain into separate clusters when titles diverge', () => {
    const clusters = buildClusters([
      tab(1, 'https://github.com/a/repo/issues/1', 'Bug tracker triage workflow'),
      tab(2, 'https://github.com/a/repo/issues/1', 'Bug tracker triage workflow'),
      tab(3, 'https://github.com/b/other/pulls/9', 'Unrelated pull request review'),
    ])
    const withMultiple = clusters.filter((c) => c.tabIds.length > 1)
    expect(withMultiple).toHaveLength(1)
    expect(clusters.some((c) => c.tabIds.includes(3))).toBe(true)
  })

  it('keeps different domains in separate clusters', () => {
    const clusters = buildClusters([
      tab(1, 'https://a.com', 'Same title'),
      tab(2, 'https://b.com', 'Same title'),
    ])
    expect(clusters).toHaveLength(2)
  })

  it('sorts clusters stalest-first', () => {
    const clusters = buildClusters([
      tab(1, 'https://a.com', 'A', 10),
      tab(2, 'https://b.com', 'B', 90),
    ])
    expect(clusters[0]!.stalenessScore).toBeGreaterThanOrEqual(
      clusters[1]!.stalenessScore,
    )
  })

  it('skips tabs without a url', () => {
    expect(buildClusters([tab(1, '', 'No url')])).toHaveLength(0)
  })
})
