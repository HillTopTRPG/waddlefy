<template>
  <contents-overlay title="Ownerrrrr" color="bg-cyan-lighten-1" :modal-value="modalValue" @close="emits('close')">
    <v-btn @click="onChangeIcon()" text="アイコンを変更する" />
  </contents-overlay>
</template>

<script lang="ts" setup>
import ContentsOverlay from '@/components/view-overlay/ContentsOverlay.vue'

import { inject } from 'vue'
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

defineProps<{
  modalValue: boolean
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

function onChangeIcon() {
  graphQlStore?.updateUserIcon()
}
</script>
