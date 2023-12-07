<template>
  <v-btn
    class="text-caption px-1"
    :color="ignoreHeiki ? 'grey' : 'info'"
    style="min-width: auto"
    :hide-details="true"
    density="comfortable"
    @click="emits('click')"
  >
    <v-icon :icon="ignoreHeiki ? 'mdi-skull' : 'mdi-emoticon-tongue'" />
    <span :class="ignoreHeiki ? 'text-decoration-line-through' : ''">平気</span>
  </v-btn>
</template>

<script setup lang="ts">
defineProps<{
  ignoreHeiki: boolean | undefined
}>()

const emits = defineEmits<{
  (e: 'click'): Promise<void>
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
