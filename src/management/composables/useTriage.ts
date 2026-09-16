/**
 * Orchestrates the management page's live view: queries chrome.tabs,
 * scores staleness, builds clusters + duplicate groups, and exposes the
 * undo-able close/save actions. Re-queries on tab events and a short
 * interval so counts stay live while the page is open — a stale cache
 * would actively work against "which can I close right now."
 */

import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { buildClusters, type ClusterableTab } from '../../lib/cluster'
import { findDuplicates } from '../../lib/duplicates'
import { getActivity } from '../../lib/activity-log'
import { scoreStaleness } from '../../lib/staleness'
import { saveReadingList } from '../../lib/reading-lists'
import type { Cluster, DuplicateGroup } from '../../lib/types'

const REFRESH_INTERVAL_MS = 3000
const UNDO_WINDOW_MS = 8000

export interface TriageTab {
  id: number
  url: string
  title: string
  favIconUrl?: string
  windowId: number
  stalenessScore: number
}

interface ClosedBatch {
  id: string
  tabs: { url: string; title: string }[]
  createdAt: number
}

export function useTriage() {
  const tabsById = reactive(new Map<number, TriageTab>())
  const clusters = ref<Cluster[]>([])
  const duplicateGroups = ref<DuplicateGroup[]>([])
  const closedThisSession = ref(0)
  const pendingUndo = ref<ClosedBatch | null>(null)
  let undoTimer: ReturnType<typeof setTimeout> | null = null
  let refreshTimer: ReturnType<typeof setInterval> | null = null

  async function refresh(): Promise<void> {
    const rawTabs = await chrome.tabs.query({})
    const scored: (ClusterableTab & Pick<TriageTab, 'favIconUrl' | 'windowId'>)[] = []

    tabsById.clear()
    for (const tab of rawTabs) {
      if (tab.id === undefined || !tab.url) continue
      const activity = await getActivity(tab.id)
      const stalenessScore = scoreStaleness({ tab, activity })
      const entry: TriageTab = {
        id: tab.id,
        url: tab.url,
        title: tab.title ?? tab.url,
        favIconUrl: tab.favIconUrl,
        windowId: tab.windowId,
        stalenessScore,
      }
      tabsById.set(tab.id, entry)
      scored.push(entry)
    }

    clusters.value = buildClusters(scored)
    duplicateGroups.value = findDuplicates(scored)
  }

  function tabsForCluster(cluster: Cluster | DuplicateGroup): TriageTab[] {
    return cluster.tabIds
      .map((id) => tabsById.get(id))
      .filter((t): t is TriageTab => t !== undefined)
  }

  function scheduleUndoExpiry() {
    if (undoTimer) clearTimeout(undoTimer)
    undoTimer = setTimeout(() => {
      pendingUndo.value = null
    }, UNDO_WINDOW_MS)
  }

  async function closeTabs(tabIds: number[]): Promise<void> {
    const closing = tabIds
      .map((id) => tabsById.get(id))
      .filter((t): t is TriageTab => t !== undefined)
    if (closing.length === 0) return

    // chrome.tabs.remove's schema validator rejects a Vue reactive Proxy
    // array (cluster.tabIds comes from a ref-wrapped object) even though its
    // contents are plain numbers — pass a genuine plain array instead.
    await chrome.tabs.remove([...tabIds])
    closedThisSession.value += closing.length
    pendingUndo.value = {
      id: `undo:${Date.now()}`,
      tabs: closing.map((t) => ({ url: t.url, title: t.title })),
      createdAt: Date.now(),
    }
    scheduleUndoExpiry()
    await refresh()
  }

  async function closeCluster(cluster: Cluster): Promise<void> {
    await closeTabs(cluster.tabIds)
  }

  async function closeDuplicateGroup(group: DuplicateGroup): Promise<void> {
    // Keep the first tab in the group, close the rest.
    await closeTabs(group.tabIds.slice(1))
  }

  async function undo(): Promise<void> {
    if (!pendingUndo.value) return
    for (const tab of pendingUndo.value.tabs) {
      await chrome.tabs.create({ url: tab.url, active: false })
    }
    closedThisSession.value = Math.max(
      0,
      closedThisSession.value - pendingUndo.value.tabs.length,
    )
    pendingUndo.value = null
    if (undoTimer) clearTimeout(undoTimer)
    await refresh()
  }

  async function saveClusterAsReadingList(cluster: Cluster): Promise<void> {
    const tabs = tabsForCluster(cluster)
    await saveReadingList(
      cluster.label,
      tabs.map((t) => ({ url: t.url, title: t.title })),
    )
    await closeTabs(cluster.tabIds)
  }

  onMounted(() => {
    void refresh()
    refreshTimer = setInterval(() => void refresh(), REFRESH_INTERVAL_MS)
    chrome.tabs.onRemoved.addListener(refresh)
    chrome.tabs.onCreated.addListener(refresh)
  })

  onUnmounted(() => {
    if (refreshTimer) clearInterval(refreshTimer)
    chrome.tabs.onRemoved.removeListener(refresh)
    chrome.tabs.onCreated.removeListener(refresh)
  })

  return {
    tabsById,
    clusters,
    duplicateGroups,
    closedThisSession,
    pendingUndo,
    tabsForCluster,
    closeCluster,
    closeDuplicateGroup,
    closeTabs,
    saveClusterAsReadingList,
    undo,
    refresh,
  }
}
