<template>
  <v-dialog v-model="dialog" :persistent="true" width="auto">
    <template v-slot:activator="{ props }">
      <span class="text-body-2 mx-3">
        <span>プレイヤー：{{ playerName }}</span>
        <v-btn icon="mdi-pencil" size="small" v-bind="props" variant="text" @click="dialog = true"></v-btn>
      </span>
    </template>

    <v-card>
      <v-toolbar density="compact" color="primary" elevation="3">
        <v-toolbar-title>{{ characterName }}のプレイヤー変更</v-toolbar-title>
      </v-toolbar>

      <v-card-item class="mt-5">
        <div class="d-flex flex-row align-end">
          <div>{{ playerName }} →</div>
          <v-select
            label="プレイヤー"
            style="min-width: 200px"
            density="compact"
            :items="players"
            item-title="name"
            item-value="id"
            :hide-details="true"
            v-model="selectValue"
          />
        </div>
      </v-card-item>

      <v-card-text class="text-body-2 mb-5">設定した秘密情報がこのプレイヤーから見えるようになります</v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn color="primary" class="flex-0-1-100" variant="flat" @click="submit()">保存</v-btn>
        <v-btn color="secondary" class="flex-0-1-100" variant="flat" @click="dialog = false">キャンセル</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const players = computed(() => [{ id: '', name: '割当なし' }, ...graphQlStore.state.players] || [])
const playerName = computed(() => players.value.find(p => p.id === props.player)?.name || '')

const dialog = ref(false)

watch(dialog, () => {
  selectValue.value = props.player
})

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  characterName: string
  player: string
}>()
const selectValue = ref(props.player)
watch(selectValue, () => {
  console.log(selectValue.value)
})

// eslint-disable-next-line unused-imports/no-unused-vars
const emits = defineEmits<{
  (e: 'submit', player: string): void
  (e: 'cancel'): void
}>()

function submit() {
  if (selectValue.value !== props.player) {
    emits('submit', selectValue.value)
  }
  dialog.value = false
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
