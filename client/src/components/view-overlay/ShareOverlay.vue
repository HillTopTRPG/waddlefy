<template>
  <contents-overlay
    title="参加してもらう"
    color="bg-orange-lighten-1"
    :modal-value="modalValue"
    image="paint_00022.jpg"
    @close="emits('close')"
  >
    <v-card-text class="px-4 py-2 overflow-auto h-100">
      <v-list class="ma-0 pa-0 bg-transparent">
        <v-list-subheader class="pa-0" style="padding-inline-start: 0 !important; min-height: auto"
          >事前に参加者アカウントを用意する（おすすめ）</v-list-subheader
        >
        <v-list-item class="mt-4 mb-8 py-0 px-0 overflow-visible">
          <v-text-field
            label="参加者名"
            color="primary"
            class="name-text-field overflow-visible"
            persistent-hint
            variant="outlined"
            hint="ログイン後に編集できます。名前の重複はできません。"
            :error-messages="addPlayerErrorMessage"
            v-model="addPlayerName"
            @keydown.enter="$event.keyCode === 13 && callAddPlayer()"
            @click:append-inner.stop
          >
            <template v-slot:append-inner>
              <v-divider :vertical="true" />
              <v-btn
                :disabled="Boolean(addPlayerErrorMessage) || !addPlayerName"
                text="作成"
                variant="text"
                class="bg-transparent h-100"
                @click.prevent.stop="callAddPlayer()"
                @mousedown.prevent.stop
                @mouseup.prevent.stop
              />
            </template>
          </v-text-field>
        </v-list-item>

        <template v-for="player in graphQlStore?.state.players" :key="player.id">
          <list-item-clipboard
            title=""
            :subtitle="playerStatusMessage(player)"
            :user-avatar-token="player.iconToken"
            :path-name="`d/${graphQlStore?.state.session?.token || ''}/${player.id}`"
          >
            {{ player.name }}のログインURL
          </list-item-clipboard>
        </template>

        <v-divider :thickness="2" class="mt-9" />

        <v-list-subheader>または、招待URLで参加してもらう</v-list-subheader>

        <list-item-clipboard
          title="招待URL"
          subtitle="誰でも参加可能になるURL"
          :path-name="`d/${graphQlStore?.state.session?.signUpToken || ''}`"
        />
      </v-list>
    </v-card-text>
  </contents-overlay>
</template>

<script lang="ts" setup>
import { computed, inject, ref } from 'vue'
import ContentsOverlay from '@/components/view-overlay/ContentsOverlay.vue'
import ListItemClipboard from '@/components/parts/ListItemClipboard.vue'
import { Player } from '@/components/graphql/schema'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

defineProps<{
  modalValue: boolean
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const addPlayerName = ref('')

const addPlayerErrorMessage = computed<string>(() => {
  if (!graphQlStore) {
    return ''
  }
  if (graphQlStore.state.players.some(p => p.name === addPlayerName.value)) {
    return '他の参加者の名前と重複しています。'
  }
  return ''
})

let lastAddName = ''

async function callAddPlayer() {
  if (!addPlayerName.value) {
    return
  }
  if (lastAddName === addPlayerName.value) return
  lastAddName = addPlayerName.value
  await graphQlStore?.addPlayerByUser(addPlayerName.value)
  addPlayerName.value = ''
  lastAddName = ''
}

function playerStatusMessage(player: Player) {
  let result
  switch (player.status) {
    case 'init':
      result = 'パスワードを設定しつつログインする状態'
      break
    case 'reset':
      result = `リセットコード: ${player.resetCode || ''}`
      break
    default:
      result = 'パスワード認証してログインする状態'
  }
  return result
}
</script>

<style lang="scss" scoped>
:deep(.v-list-item) {
  background-color: rgba(255, 255, 255, 0.4);

  .v-list-item__content {
    overflow: visible;
  }
}

.name-text-field:deep(.v-field--appended) {
  padding-inline-end: 0;
}

.name-text-field:deep(.v-input__append) {
  margin: 0;
}

:deep(.v-list-item-title),
:deep(.v-list-item-subtitle) {
  user-select: none;
}
</style>
