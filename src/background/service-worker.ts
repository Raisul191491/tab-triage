/**
 * MV3 background service worker.
 * Tracks tab creation/activation into the activity log (survives worker
 * restarts by persisting to chrome.storage.local on every event — MV3
 * workers are ephemeral, in-memory state cannot be trusted to survive).
 * Also runs a periodic prune of records for tabs that no longer exist and
 * keeps the toolbar badge showing the stale-tab count.
 */

import { pruneClosed, recordActivated, recordCreated } from '../lib/activity-log'
import { isExemptFromStaleness, scoreStaleness, stalenessLabel } from '../lib/staleness'
import { getActivity } from '../lib/activity-log'
import { getSettings } from '../lib/storage'

const PRUNE_ALARM = 'tt:prune'

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(PRUNE_ALARM, { periodInMinutes: 60 })
})

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.id !== undefined && tab.url) void recordCreated(tab.id, tab.url)
})

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab.url) return
    void recordActivated(tabId, tab.url)
  })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // A navigated tab (URL changed in place) counts as freshly activated —
  // otherwise a long-lived pinned tab that gets reused for many searches
  // would look permanently stale.
  if (changeInfo.url && tab.url) void recordActivated(tabId, tab.url)
})

async function refreshBadge(): Promise<void> {
  const settings = await getSettings()
  const tabs = await chrome.tabs.query({})
  let staleCount = 0
  for (const tab of tabs) {
    if (tab.id === undefined || isExemptFromStaleness(tab)) continue
    const activity = await getActivity(tab.id)
    const score = scoreStaleness({ tab, activity })
    if (stalenessLabel(score) === 'stale' || stalenessLabel(score) === 'very-stale') {
      staleCount++
    }
  }
  const text =
    tabs.length >= settings.staleThresholdBadgeCount && staleCount > 0
      ? String(staleCount)
      : ''
  chrome.action.setBadgeText({ text })
  chrome.action.setBadgeBackgroundColor({ color: '#AFA9EC' })
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== PRUNE_ALARM) return
  const tabs = await chrome.tabs.query({})
  await pruneClosed(
    new Set(tabs.map((t) => t.id).filter((id): id is number => id !== undefined)),
  )
  await refreshBadge()
})

chrome.tabs.onRemoved.addListener(() => void refreshBadge())
chrome.tabs.onCreated.addListener(() => void refreshBadge())
void refreshBadge()
