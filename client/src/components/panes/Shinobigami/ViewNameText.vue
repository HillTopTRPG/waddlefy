<template>
  <span>〔<v-icon size="small" :icon="icon" />{{ name }}〕</span>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  name: string
}>()
</script>

<style lang="scss" scoped></style>
