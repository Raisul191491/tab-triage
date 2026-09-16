<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTriage } from './composables/useTriage'
import SummaryHeader from './components/SummaryHeader.vue'
import ClusterCard from './components/ClusterCard.vue'
import DuplicateGroupCard from './components/DuplicateGroupCard.vue'
import UndoToast from './components/UndoToast.vue'

const {
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
} = useTriage()

type Filter = 'all' | 'stale' | 'duplicates'
const filter = ref<Filter>('all')

const windowCount = computed(() =>
  new Set(clusters.value.flatMap((c) => c.tabIds)).size > 0
    ? new Set(clusters.value.flatMap((c) => tabsForCluster(c)).map((t) => t.windowId))
        .size
    : 0,
)

const totalTabs = computed(() =>
  clusters.value.reduce((sum, c) => sum + c.tabIds.length, 0),
)

const visibleClusters = computed(() => {
  if (filter.value === 'duplicates') return []
  if (filter.value === 'stale') {
    return clusters.value.filter((c) => c.stalenessScore >= 45)
  }
  return clusters.value
})

const visibleDuplicates = computed(() =>
  filter.value === 'stale' ? [] : duplicateGroups.value,
)
</script>

<template>
  <div class="min-h-screen bg-popup-bg text-popup-text antialiased">
    <SummaryHeader
      :total-tabs="totalTabs"
      :window-count="windowCount"
      :closed-this-session="closedThisSession"
    />

    <div class="mx-auto max-w-3xl px-6 py-6">
      <div class="mb-4 flex gap-1.5">
        <button
          v-for="f in ['all', 'stale', 'duplicates'] as Filter[]"
          :key="f"
          class="rounded-lg px-3 py-1.5 text-[12px] font-medium capitalize transition-colors"
          :class="
            filter === f
              ? 'bg-accent-soft text-accent'
              : 'text-popup-muted hover:text-popup-text'
          "
          @click="filter = f"
        >
          {{ f }}
        </button>
      </div>

      <div v-if="visibleDuplicates.length" class="mb-4 space-y-2">
        <div class="text-[10.5px] font-medium tracking-[0.08em] text-popup-faint">
          DUPLICATES
        </div>
        <DuplicateGroupCard
          v-for="group in visibleDuplicates"
          :key="group.id"
          :group="group"
          :tabs="tabsForCluster(group)"
          @close-extra="closeDuplicateGroup"
        />
      </div>

      <div class="space-y-2">
        <ClusterCard
          v-for="cluster in visibleClusters"
          :key="cluster.id"
          :cluster="cluster"
          :tabs="tabsForCluster(cluster)"
          @close-stale="closeCluster"
          @save-as-reading-list="saveClusterAsReadingList"
          @close-tab="(id) => closeTabs([id])"
        />
        <p
          v-if="visibleClusters.length === 0 && visibleDuplicates.length === 0"
          class="py-12 text-center text-[12.5px] text-popup-muted"
        >
          Nothing here.
        </p>
      </div>
    </div>

    <UndoToast v-if="pendingUndo" :count="pendingUndo.tabs.length" @undo="undo" />
  </div>
</template>
