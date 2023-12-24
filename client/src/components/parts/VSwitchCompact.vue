<template>
  <v-switch density="compact" :hide-details="true" true-icon="mdi-check" color="primary" class="ml-3">
    <template #label="{ label }">
      <template v-if="label">
        {{ i18n ? $t(label) : label }}
      </template>
    </template>
  </v-switch>
</template>

<script setup lang="ts">
defineProps<{
  i18n?: boolean
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
