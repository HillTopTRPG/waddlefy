<template>
  <v-overlay
    :model-value="modalValue"
    :persistent="true"
    :contained="true"
    :scrim="false"
    z-index="1000"
    class="d-flex justify-center align-center bg-transparent"
  >
    <v-progress-circular indeterminate :size="size!" :width="width!" :color="color!" />
  </v-overlay>
</template>

<script lang="ts" setup>
// noinspection TypeScriptValidateTypes
withDefaults(defineProps<{
  modalValue: boolean
  size?: number
  width?: number
  color?: string
}>(), {
  size: 64,
  width: 10
})
</script>
