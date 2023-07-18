<template>
  <contents-overlay
    title="Playerrrrr"
    color="bg-light-green"
    :modal-value="modalValue"
    image="white_00053.jpg"
    @close="emits('close')"
  >

  </contents-overlay>
</template>

<script lang="ts" setup>
import ContentsOverlay from '@/components/view-overlay/ContentsOverlay.vue'

defineProps<{
  modalValue: boolean
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()
</script>
