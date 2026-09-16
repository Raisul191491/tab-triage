<script setup lang="ts">
import type { TriageTab } from '../composables/useTriage'
import { stalenessLabel } from '../../lib/staleness'

const props = defineProps<{ tab: TriageTab }>()
const emit = defineEmits<{ close: [id: number] }>()

const LABEL_COLOR: Record<string, string> = {
  fresh: 'text-popup-faint',
  idle: 'text-popup-muted',
  stale: 'text-accent',
  'very-stale': 'text-accent',
}
</script>

<template>
  <div class="flex items-center gap-2 py-1.5 pl-8 pr-2 text-[12px]">
    <img
      v-if="tab.favIconUrl"
      :src="tab.favIconUrl"
      class="h-3.5 w-3.5 shrink-0"
      alt=""
    />
    <span v-else class="h-3.5 w-3.5 shrink-0 rounded-sm bg-popup-border" />
    <span class="flex-1 truncate text-popup-text">{{ tab.title }}</span>
    <span
      class="shrink-0 text-[10.5px]"
      :class="LABEL_COLOR[stalenessLabel(tab.stalenessScore)]"
      >{{ stalenessLabel(tab.stalenessScore).replace('-', ' ') }}</span
    >
    <button
      class="shrink-0 rounded px-1.5 py-0.5 text-[11px] text-popup-faint transition-colors hover:bg-white/5 hover:text-popup-text"
      @click="emit('close', props.tab.id)"
    >
      Close
    </button>
  </div>
</template>
