<template>
  <v-overlay
    :model-value="modelValue"
    @update:model-value="emits('close')"
    :contained="true"
    transition="slide-x-transition"
    :close-on-back="true"
    :no-click-animation="true"
    class="contents-overlay ma-0"
    :style="`border-left: ${color} 2px solid; --img:url('/${image}'); backdrop-filter: blur(2px)`"
    :content-props="{ class: 'w-100 h-100 bg-white', style: 'max-width: 400px' }"
  >
    <v-layout class="w-100 h-100">
      <v-card class="w-100 ma-0 d-flex flex-column" style="border-radius: 0">
        <v-card-title class="d-flex justify-space-between align-center py-1">
          <span>{{ title }}</span>
          <v-btn icon="mdi-close" variant="text" size="small" style="font-size: 0.8em" @click="emits('close')"></v-btn>
        </v-card-title>
        <slot />
      </v-card>
    </v-layout>
  </v-overlay>
</template>

<script lang="ts" setup>
// noinspection TypeScriptValidateTypes
defineProps<{
  modelValue: boolean
  color: string
  title: string
  image: string
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()
</script>

<style lang="scss" scoped>
.v-overlay {
  :deep(.v-card) {
    background: var(--img);
    background-color: rgba(255, 255, 255, 0.4);
    background-blend-mode: lighten;
  }
  :deep(.v-card-title) {
    user-select: none;
    background-color: rgba(var(--v-theme-secondary), 0.2);
    border-bottom: 1px solid rgba(100, 100, 100, 0.2);
  }
}
</style>
