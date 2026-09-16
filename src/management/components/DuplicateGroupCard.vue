<script setup lang="ts">
import type { DuplicateGroup } from '../../lib/types'
import type { TriageTab } from '../composables/useTriage'

const props = defineProps<{ group: DuplicateGroup; tabs: TriageTab[] }>()
const emit = defineEmits<{ closeExtra: [group: DuplicateGroup] }>()
</script>

<template>
  <div class="rounded-popup border border-accent/30 bg-popup-surface px-4 py-3">
    <div class="flex items-center gap-3">
      <span class="text-[13px] font-medium text-popup-text"
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
  </div>
</template>
