<template>
  <contents-overlay title="共有する" color="bg-orange-lighten-1" :modal-value="modalValue" @close="emits('close')">
    <v-card-text class="pa-2 overflow-auto h-100">
      <v-list class="ma-0 pa-0 bg-transparent">

        <v-list-subheader><v-icon icon="mdi-star" />おすすめ<br>参加者に個別の招待URLを発行するには</v-list-subheader>
        <v-list-item class="my-1 py-0 px-3 mt-5">
          <v-text-field
            label="参加者名"
            color="primary"
            class="name-text-field"
            base-color="secondary"
            :error-messages="addPlayerErrorMessage"
            v-model="addPlayerName"
            @click:append-inner.stop
          >
            <template v-slot:append class="ma-0"></template>
            <template v-slot:append-inner>
              <v-divider :vertical="true" />
              <v-btn
                :disabled="Boolean(addPlayerErrorMessage) || !addPlayerName"
                text="追加"
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
            :title="player.name"
            subtitle=""
            :path-name="`d/${graphQlStore?.state.dashboard?.token || ''}/${player.id}`"
          />
        </template>

        <v-divider :thickness="2" class="mt-3 mt-2" />

        <v-list-subheader>全員に同じURLを伝えて集合してもらうには</v-list-subheader>

        <list-item-clipboard
          title="オープン招待URL"
          subtitle="このURLを使えば誰でも参加可能"
          :path-name="`d/${graphQlStore?.state.dashboard?.signUpToken || ''}`"
        />
      </v-list>
    </v-card-text>
  </contents-overlay>
</template>

<script lang="ts" setup>
import {computed, inject, ref} from 'vue'
import ContentsOverlay from '@/components/view-overlay/ContentsOverlay.vue'
import ListItemClipboard from '@/components/parts/ListItemClipboard.vue'

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
})

async function callAddPlayer() {
  if (!addPlayerName.value) {
    return
  }
  await graphQlStore?.addPlayer(addPlayerName.value)
  addPlayerName.value = ''
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
