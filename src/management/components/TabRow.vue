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

/** Jump to this tab: focus its window, then activate it within that window. */
async function activate(): Promise<void> {
  await chrome.windows.update(props.tab.windowId, { focused: true })
  await chrome.tabs.update(props.tab.id, { active: true })
}
</script>

<template>
  <div
    class="flex cursor-pointer items-center gap-2 py-1.5 pl-8 pr-2 text-[12px] transition-colors hover:bg-white/5"
    @click="activate"
  >
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
      class="shrink-0 rounded px-1.5 py-0.5 text-[11px] text-popup-faint transition-colors hover:bg-white/10 hover:text-popup-text"
      @click.stop="emit('close', props.tab.id)"
    >
      Close
    </button>
  </div>
</template>
