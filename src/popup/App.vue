<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getActivity } from '../lib/activity-log'
import { scoreStaleness, stalenessLabel } from '../lib/staleness'
import { findDuplicates } from '../lib/duplicates'

const totalTabs = ref(0)
const staleTabs = ref(0)
const duplicateTabs = ref(0)

onMounted(async () => {
  const tabs = await chrome.tabs.query({})
  totalTabs.value = tabs.length

  let stale = 0
  for (const tab of tabs) {
    if (tab.id === undefined) continue
    const activity = await getActivity(tab.id)
    const score = scoreStaleness({ tab, activity })
    const label = stalenessLabel(score)
    if (label === 'stale' || label === 'very-stale') stale++
  }
  staleTabs.value = stale

  const dupGroups = findDuplicates(
    tabs
      .filter(
        (t): t is chrome.tabs.Tab & { id: number; url: string } =>
          t.id !== undefined && Boolean(t.url),
      )
      .map((t) => ({ id: t.id, url: t.url })),
  )
  duplicateTabs.value = dupGroups.reduce((sum, g) => sum + g.tabIds.length, 0)
})

function openManagementPage() {
  chrome.runtime.openOptionsPage()
}
</script>

<template>
  <div class="w-72 bg-popup-bg p-4 text-popup-text antialiased">
    <header class="mb-3 flex items-center gap-2.5">
      <span
        class="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-sm"
        >🗂️</span
      >
      <h1 class="text-[13px] font-medium">Tab Triage</h1>
    </header>

    <div class="rounded-popup border border-popup-border bg-popup-surface p-4">
      <div class="text-[22px] font-medium tabular-nums">{{ totalTabs }}</div>
      <div class="text-[11px] text-popup-muted">tabs open</div>
      <div class="mt-3 flex gap-4 text-[11.5px]">
        <span class="text-popup-muted"
          ><span class="font-medium text-accent">{{ staleTabs }}</span> stale</span
        >
        <span class="text-popup-muted"
          ><span class="font-medium text-accent">{{ duplicateTabs }}</span>
          duplicates</span
        >
      </div>
    </div>

    <button
      class="mt-3 w-full rounded-lg bg-accent py-2 text-[12.5px] font-medium text-popup-bg transition-colors hover:bg-accent-dim"
      @click="openManagementPage"
    >
      Open Tab Triage
    </button>
  </div>
</template>
