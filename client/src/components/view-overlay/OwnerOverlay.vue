<template>
  <contents-overlay
    title="主催者の設定"
    color="bg-cyan-lighten-1"
    class="contents-overlay"
    :modal-value="modalValue"
    image="paint_00005.jpg"
    @close="emits('close')"
  >
    <v-card-text class="pa-2 overflow-auto h-100">
      <v-list class="ma-0 pa-0 bg-transparent">
        <v-list-subheader style="min-height: auto; background: none;">名前</v-list-subheader>
        <v-list-item>
          <natural-text-field
            label="あなたの名前"
            :value="graphQlStore?.state.user?.name || ''"
            @submit="v => graphQlStore?.updateUserName(v)"
          />
        </v-list-item>
        <v-list-item>
          <v-btn
            @click="onChangeIcon()"
            v-if="graphQlStore?.state.user?.token"
            variant="outlined"
            text="アイコンを変更する"
          />
        </v-list-item>
      </v-list>
    </v-card-text>
  </contents-overlay>
</template>

<script lang="ts" setup>
import ContentsOverlay from '@/components/view-overlay/ContentsOverlay.vue'
import NaturalTextField from '@/components/NaturalTextField.vue'

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
