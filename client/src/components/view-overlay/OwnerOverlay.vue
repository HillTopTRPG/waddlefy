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
        <v-list-item>
          <menu-edit-text-field
            label="あなたの名前"
            :text="graphQlStore?.state.user?.name || ''"
            :editable="Boolean(graphQlStore?.state.user?.token)"
            :width="22"
            @update="graphQlStore?.updateUserName"
          />
        </v-list-item>
        <v-list-item>
          <v-btn
            @click="onChangeIcon()"
            v-if="graphQlStore?.state.user?.token"
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
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'
import { inject, ref, watch } from 'vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

defineProps<{
  modalValue: boolean
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const isLoading = ref(false)
watch(
  () => graphQlStore?.state.user?.iconToken,
  v => {
    if (!v) return
    isLoading.value = false
  }
)

function onChangeIcon() {
  isLoading.value = true
  graphQlStore?.updateUserIcon()
}
</script>
