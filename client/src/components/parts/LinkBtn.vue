<template>
  <v-btn
    icon="mdi-open-in-new"
    class="ml-2"
    variant="text"
    size="small"
    density="comfortable"
    target="_blank"
    rel="noopener noreferrer"
    :href="href"
  />
</template>

<script lang="ts" setup>
defineProps<{
  href: string
}>()
</script>
