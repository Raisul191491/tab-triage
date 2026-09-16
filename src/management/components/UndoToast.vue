<script setup lang="ts">
defineProps<{ count: number }>()
const emit = defineEmits<{ undo: [] }>()
</script>

<template>
  <div
    class="fixed bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-popup border border-popup-border bg-popup-surface px-4 py-2.5 shadow-lg"
  >
    <span class="text-[12.5px] text-popup-text"
      >Closed {{ count }} {{ count === 1 ? 'tab' : 'tabs' }}</span
    >
    <button
      class="text-[12.5px] font-medium text-accent transition-colors hover:text-accent-dim"
      @click="emit('undo')"
    >
      Undo
    </button>
  </div>
</template>
