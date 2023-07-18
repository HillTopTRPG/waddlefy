<template>
  <v-list-item :style="toggle ? 'border-radius: 10px 0 0 10px;' : ''">
    <template v-slot:prepend>
      <v-icon :icon="`mdi-${icon}`" class="mr-6" />
    </template>
    <v-list-item-title v-if="!rail">{{ title }}</v-list-item-title>
    <v-list-item-subtitle v-if="!rail && subtitle">{{ subtitle }}</v-list-item-subtitle>
  </v-list-item>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  rail: boolean
  icon: string
  toggle: boolean
}>()
</script>
