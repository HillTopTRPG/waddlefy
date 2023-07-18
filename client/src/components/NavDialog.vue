<template>
  <v-dialog
    :model-value="modalValue"
    :attach="attach"
    :fullscreen="true"
    :scrim="false"
    :no-click-animation="true"
    :persistent="true"
    class="my-16"
    transition="slide-y-reverse-transition"
  >
    <v-card>
      <v-toolbar color="secondary" class="px-2" density="compact" :title="title">
        <v-toolbar-items>
          <v-btn variant="text" icon="mdi-close" @click="emits('close')" />
        </v-toolbar-items>
      </v-toolbar>
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
}
</style>
