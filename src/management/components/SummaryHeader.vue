<script setup lang="ts">
defineProps<{
  totalTabs: number
  windowCount: number
  closedThisSession: number
}>()
</script>

<template>
  <header class="flex items-center gap-6 border-b border-popup-border px-6 py-4">
    <div class="flex items-center gap-2">
      <span
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-base"
        >🗂️</span
      >
      <h1 class="text-[15px] font-medium">Tab Triage</h1>
    </div>
    <div class="ml-auto flex gap-6 text-[12.5px] text-popup-muted">
      <span
        >{{ totalTabs }} tabs · {{ windowCount }}
        {{ windowCount === 1 ? 'window' : 'windows' }}</span
      >
      <span v-if="closedThisSession > 0" class="text-accent"
        >{{ closedThisSession }} closed this session</span
      >
    </div>
  </header>
</template>
