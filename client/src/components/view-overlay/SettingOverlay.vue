<template>
  <contents-overlay title="画面の設定" color="bg-light-green" :modal-value="modalValue" @close="emits('close')">

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
