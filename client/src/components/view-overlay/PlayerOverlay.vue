<template>
  <contents-overlay
    :title="(player?.name || '') + (player?.token ? '(あなた)' : '')"
    color="bg-light-green"
    :model-value="Boolean(modelValue)"
    image="white_00053.jpg"
    @close="emits('close')"
  >
    <v-card-text class="pa-2 overflow-auto h-100">
      <v-list class="ma-0 pa-0 bg-transparent">
        <v-list-item v-if="isUserControl || player?.token">
          <menu-edit-text-field
            label="名前"
            :text="player?.name || ''"
            :editable="true"
            :width="22"
            @update="v => graphQlStore?.updatePlayerName(player?.id || '', v)"
          />
        </v-list-item>
        <v-list-item v-if="isUserControl || player?.token">
          <v-btn
            @click="onChangeIcon()"
            variant="outlined"
            text="アイコンを変更する"
            :loading="isLoading"
            :disabled="isLoading"
          />
        </v-list-item>
        <v-list-item class="mt-2" v-if="isUserControl && player">
          <delete-menu-btn :target-name="player.name || ''" type="参加者" @execute="onDeletePlayer()" />
        </v-list-item>
      </v-list>
    </v-card-text>
  </contents-overlay>
</template>

<script lang="ts" setup>
import ContentsOverlay from '@/components/view-overlay/ContentsOverlay.vue'

import DeleteMenuBtn from '@/components/DeleteMenuBtn.vue'
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'
import { computed, inject, ref, watch } from 'vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  modelValue: string
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const isUserControl = computed(() => Boolean(graphQlStore?.state.user?.token))

const player = computed(() => {
  if (!graphQlStore) return null
  if (graphQlStore.state.player?.id === props.modelValue) return graphQlStore.state.player
  return graphQlStore.state.players.find(p => p.id === props.modelValue)
})

const isLoading = ref(false)
watch(
  () => player.value?.iconToken,
  v => {
    if (!v) return
    isLoading.value = false
  }
)

function onChangeIcon() {
  isLoading.value = true
  graphQlStore?.updatePlayerIcon(props.modelValue)
}

async function onDeletePlayer() {
  await graphQlStore?.deletePlayer(player.value?.id || '')
  emits('close')
}
</script>
