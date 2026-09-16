<script setup lang="ts">
import { ref } from 'vue'
import type { DuplicateGroup } from '../../lib/types'
import type { TriageTab } from '../composables/useTriage'
import TabRow from './TabRow.vue'

const props = defineProps<{ group: DuplicateGroup; tabs: TriageTab[] }>()
const emit = defineEmits<{
  closeExtra: [group: DuplicateGroup]
  closeTab: [id: number]
}>()

const expanded = ref(false)
</script>

<template>
  <div class="rounded-popup border border-accent/30 bg-popup-surface">
    <div class="flex items-center gap-3 px-4 py-3">
      <button
        class="text-popup-faint transition-transform"
        :class="{ 'rotate-90': expanded }"
        @click="expanded = !expanded"
      >
        ▸
      </button>
      <span class="shrink-0 text-[13px] font-medium text-popup-text"
        >{{ props.tabs.length }}× open</span
      >
      <span class="min-w-0 flex-1 truncate text-[12px] text-popup-muted">{{
        props.tabs[0]?.title
      }}</span>
      <button
        class="shrink-0 rounded-lg bg-accent-soft px-2.5 py-1 text-[11.5px] font-medium text-accent transition-colors hover:bg-accent/25"
        @click="emit('closeExtra', props.group)"
      >
        Keep one, close rest
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
