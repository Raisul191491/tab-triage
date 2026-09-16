import { describe, expect, it } from 'vitest'
import { findDuplicates, normalizeUrl } from '../src/lib/duplicates'

describe('normalizeUrl', () => {
  it('strips tracking params', () => {
    expect(normalizeUrl('https://example.com/a?utm_source=x&id=5')).toBe(
      'https://example.com/a?id=5',
    )
  })

  it('drops the fragment', () => {
    expect(normalizeUrl('https://example.com/a#section-2')).toBe(
      'https://example.com/a',
    )
  })

  it('leaves genuinely different pages distinct', () => {
    expect(normalizeUrl('https://example.com/page/1')).not.toBe(
      normalizeUrl('https://example.com/page/2'),
    )
  })

  it('falls back to the raw string on an invalid URL', () => {
    expect(normalizeUrl('not-a-url')).toBe('not-a-url')
  })
})

describe('findDuplicates', () => {
  it('groups tabs with the same normalized URL', () => {
    const groups = findDuplicates([
      { id: 1, url: 'https://example.com/a?utm_source=x' },
      { id: 2, url: 'https://example.com/a?utm_source=y' },
      { id: 3, url: 'https://example.com/b' },
    ])
    expect(groups).toHaveLength(1)
    expect(groups[0]!.tabIds.sort()).toEqual([1, 2])
  })

  it('returns no groups when nothing is duplicated', () => {
    const groups = findDuplicates([
      { id: 1, url: 'https://a.com' },
      { id: 2, url: 'https://b.com' },
    ])
    expect(groups).toHaveLength(0)
  })

  it('ignores tabs without a url', () => {
    expect(findDuplicates([{ id: 1, url: '' }])).toHaveLength(0)
  })
})
