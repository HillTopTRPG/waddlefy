<template>
  <v-dialog
    :model-value="modalValue"
    :attach="attach"
    :fullscreen="true"
    :scrim="false"
    :no-click-animation="true"
    :persistent="true"
    class="my-16 nav-dialog"
    transition="slide-y-reverse-transition"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center py-1">
        <span>{{ title }}</span>
        <v-btn icon="mdi-close" variant="text" size="small" style="font-size: 0.8em" @click="emits('close')"></v-btn>
      </v-card-title>
      <slot />
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
const props = defineProps<{
  modalValue: boolean
  title: string
  attach: string
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()
</script>

<style lang="scss" scoped>
.v-dialog {
  margin-right: -1px;

  .v-card-title {
    user-select: none;
    background-color: rgba(var(--v-theme-secondary), 0.2);
    border-bottom: 1px solid rgba(100, 100, 100, 0.2);
  }
}
</style>
