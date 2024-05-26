<template>
  <v-layout class="root h-100 flex-column bg-transparent">
    <v-sheet :color="titleColor" height="2rem" class="px-4 d-flex flex-row align-center bg-transparent">
      <span class="flex-grow-1" style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden">{{
        title
      }}</span>
      <slot name="title-action" />
    </v-sheet>
    <v-layout class="w-100 h-100 d-flex flex-column align-self-start bg-transparent" style="justify-self: flex-start">
      <slot name="layout" />
      <slot name="nav" />
      <div
        class="d-flex align-start align-content-start position-relative w-100 h-100 flex-wrap overflow-auto bg-transparent"
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
import { computed, ref } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const titleColor = computed(() => (theme.global.name.value === 'dark' ? 'grey-darken-3' : 'amber-lighten-5'))

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
