<script setup lang="ts">
import { ref } from 'vue'
import type { Cluster } from '../../lib/types'
import type { TriageTab } from '../composables/useTriage'
import { stalenessLabel } from '../../lib/staleness'
import TabRow from './TabRow.vue'

const props = defineProps<{ cluster: Cluster; tabs: TriageTab[] }>()
const emit = defineEmits<{
  closeStale: [cluster: Cluster]
  saveAsReadingList: [cluster: Cluster]
  closeTab: [id: number]
}>()

const expanded = ref(false)

const BADGE_STYLE: Record<string, string> = {
  fresh: 'bg-popup-border text-popup-muted',
  idle: 'bg-popup-border text-popup-muted',
  stale: 'bg-accent-soft text-accent',
  'very-stale': 'bg-accent text-popup-bg',
}
</script>

<template>
  <div class="rounded-popup border border-popup-border bg-popup-surface">
    <div class="flex items-center gap-3 px-4 py-3">
      <button
        class="text-popup-faint transition-transform"
        :class="{ 'rotate-90': expanded }"
        @click="expanded = !expanded"
      >
        ▸
      </button>
      <div class="min-w-0 flex-1">
        <div class="truncate text-[13px] font-medium text-popup-text">
          {{ props.cluster.label }}
        </div>
        <div class="text-[11px] text-popup-muted">{{ props.tabs.length }} tabs</div>
      </div>
      <span
        class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
        :class="BADGE_STYLE[stalenessLabel(props.cluster.stalenessScore)]"
        >{{ stalenessLabel(props.cluster.stalenessScore).replace('-', ' ') }}</span
      >
      <button
        class="shrink-0 rounded-lg border border-popup-border px-2.5 py-1 text-[11.5px] text-popup-text transition-colors hover:border-white/20"
        @click="emit('saveAsReadingList', props.cluster)"
      >
        Save list
      </button>
      <button
        class="shrink-0 rounded-lg bg-accent-soft px-2.5 py-1 text-[11.5px] font-medium text-accent transition-colors hover:bg-accent/25"
        @click="emit('closeStale', props.cluster)"
      >
        Close stale
      </button>
    </div>
    <div v-if="expanded" class="border-t border-popup-border pb-1">
      <TabRow
        v-for="tab in props.tabs"
        :key="tab.id"
        :tab="tab"
        @close="emit('closeTab', $event)"
      />
    </div>
  </div>
</template>
