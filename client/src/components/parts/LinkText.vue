<template>
  <a :href="href" class="d-flex overflow-hidden" target="_blank" rel="noopener noreferrer">
    <img :alt="alt" :src="src" :height="height || 'auto'" />
  </a>
</template>

<script lang="ts" setup>
defineProps<{
  href: string
  alt: string
  src: string
  height?: string
}>()
</script>
