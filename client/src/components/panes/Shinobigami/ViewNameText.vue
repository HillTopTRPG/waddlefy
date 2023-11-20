<template>
  <span>〔<v-icon size="small" :icon="icon" />{{ name }}〕</span>
</template>

<script setup lang="ts">
// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  icon: string
  name: string
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
