<template>
  <v-overlay
    :model-value="modalValue"
    @update:model-value="emits('close')"
    :persistent="false"
    :contained="true"
    transition="slide-x-transition"
    :scrim="false"
    :close-on-back="true"
    :no-click-animation="true"
    class="ma-0"
    style="max-width: 400px"
    content-class="w-100 h-100"
  >
    <v-layout class="w-100 h-100">
      <v-card class="w-100 ma-0 d-flex flex-column">
        <v-card-title class="d-flex justify-space-between align-center py-1" :class="color">
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
  modalValue: boolean
  color: string
  title: string
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()
</script>

<style lang="scss" scoped>
:deep(.v-card-title) {
  user-select: none;
}
</style>
