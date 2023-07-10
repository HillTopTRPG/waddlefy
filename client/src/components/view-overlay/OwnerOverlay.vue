<template>
  <contents-overlay title="Ownerrrrr" color="bg-cyan-lighten-1" :modal-value="modalValue" @close="emits('close')">

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
