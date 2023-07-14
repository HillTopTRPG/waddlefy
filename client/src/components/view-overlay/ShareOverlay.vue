<template>
  <contents-overlay
    title="参加してもらう"
    color="bg-orange-lighten-1"
    :modal-value="modalValue"
    @close="emits('close')"
  >
    <v-card-text class="pa-2 overflow-auto h-100">
      <v-list class="ma-0 pa-0 bg-transparent">
        <v-list-subheader>事前に参加者アカウントを用意する（おすすめ）</v-list-subheader>
        <v-list-item class="mt-1 mb-2 py-0 px-3">
          <v-text-field
            label="参加者名"
            color="primary"
            class="name-text-field"
            persistent-hint
            hint="ログイン後に編集できます。名前の重複はできません。"
            :error-messages="addPlayerErrorMessage"
            v-model="addPlayerName"
            @keydown.enter="$event.keyCode === 13 && callAddPlayer()"
            @click:append-inner.stop
          >
            <template v-slot:append class="ma-0"></template>
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

        <v-divider :thickness="2" class="mt-3 mt-2" />

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

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import { Player } from '@/components/graphql/schema'
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

async function callAddPlayer() {
  if (!addPlayerName.value) {
    return
  }
  await graphQlStore?.addPlayerByUser(addPlayerName.value)
  addPlayerName.value = ''
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
.v-card-text {
  background-image: url('/karafuruosyare-haikei5.png');
  background-position: -80px 50px;
  background-color: rgba(255, 255, 255, 0.8);
  background-blend-mode: lighten;
}
:deep(.v-list-item) {
  background-color: rgba(255, 255, 255, 0.6);
}

.name-text-field:deep(.v-field--appended) {
  padding-inline-end: 0
}

.name-text-field:deep(.v-input__append) {
  margin: 0;
}

:deep(.v-list-item-title),
:deep(.v-list-item-subtitle) {
  user-select: none;
}
</style>
