<template>
  <contents-overlay
    :title="(player?.name || '') + (player?.token ? '(あなた)' : '')"
    color="bg-light-green"
    :modal-value="Boolean(modalValue)"
    image="white_00053.jpg"
    @close="emits('close')"
  >
    <v-card-text class="pa-2 overflow-auto h-100">
      <v-list class="ma-0 pa-0 bg-transparent">
        <v-list-item>
          <v-btn
            @click="onChangeIcon()"
            v-if="player?.token"
            variant="outlined"
            text="アイコンを変更する"
            :loading="isLoading"
            :disabled="isLoading"
          />
        </v-list-item>
      </v-list>
    </v-card-text>
  </contents-overlay>
</template>

<script lang="ts" setup>
import ContentsOverlay from '@/components/view-overlay/ContentsOverlay.vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import { computed, inject, ref, watch } from 'vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  modalValue: string
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const player = computed(() => {
  if (!graphQlStore) return null
  if (graphQlStore.state.player?.id === props.modalValue) return graphQlStore.state.player
  return graphQlStore.state.players.find(p => p.id === props.modalValue)
})

const isLoading = ref(false)
watch(
  () => graphQlStore.state.player?.iconToken,
  v => {
    if (!v) return
    isLoading.value = false
  }
)

function onChangeIcon() {
  isLoading.value = true
  graphQlStore?.updatePlayerIcon()
}
</script>
