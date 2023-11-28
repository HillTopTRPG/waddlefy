<template>
  <v-layout class="root h-100 flex-column">
    <v-sheet color="amber-lighten-5" height="2rem" class="px-4 d-flex flex-row align-center">
      <span class="flex-grow-1" style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden">{{
        title
      }}</span>
      <slot name="title-action" />
    </v-sheet>
    <slot name="layout" />
    <v-layout class="w-100 h-100" style="justify-self: flex-start; align-self: flex-start">
      <slot name="nav" />
      <div
        class="d-flex align-start align-content-start position-relative w-100 h-100 flex-wrap overflow-auto"
        style="contain: paint"
      >
        <slot />
      </div>
    </v-layout>
  </v-layout>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
