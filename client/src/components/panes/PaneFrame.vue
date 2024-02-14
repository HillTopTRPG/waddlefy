<template>
  <v-layout class="root h-100 flex-column">
    <v-sheet color="amber-lighten-5" height="2rem" class="px-4 d-flex flex-row align-center">
      <span class="flex-grow-1" style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden">{{
        title
      }}</span>
      <slot name="title-action" />
    </v-sheet>
    <v-layout class="w-100 h-100 d-flex flex-column align-self-start" style="justify-self: flex-start">
      <slot name="layout" />
      <slot name="nav" />
      <div
        class="d-flex align-start align-content-start position-relative w-100 h-100 flex-wrap overflow-auto"
        :class="viewScrollbar ? 'scrollbar-show' : 'scrollbar-hide'"
        v-scroll.self="() => onScroll()"
        style="contain: paint"
      >
        <slot />
      </div>
    </v-layout>
  </v-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
}>()

const scrollTimeout = ref<number | null>(null)
const viewScrollbar = ref(false)

function onScroll() {
  viewScrollbar.value = true
  if (scrollTimeout.value !== null) {
    window.clearTimeout(scrollTimeout.value)
    scrollTimeout.value = null
  }
  scrollTimeout.value = window.setTimeout(() => {
    viewScrollbar.value = false
  }, 500)
}
</script>
