<template>
  <v-dialog
    :model-value="modalValue"
    attach="#play-main-navigation-drawer"
    :fullscreen="true"
    :scrim="false"
    :persistent="true"
    class="mb-16 mt-16"
    :transition="transition"
  >
    <v-card>
      <v-toolbar color="secondary" class="px-2" density="compact" :title="title">
        <v-toolbar-items>
          <v-btn variant="text" icon="mdi-close" @click="emits('update:modalValue', !modalValue)" />
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
  transition: string
}>()

const emits = defineEmits<{
  (e: 'update:modalValue', value: boolean): void
}>()
</script>
