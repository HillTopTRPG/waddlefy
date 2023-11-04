<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ attrs }">
      <span class="text-body-2 mx-3">
        <span>プレイヤー：{{ playerName }}</span>
        <v-btn icon="mdi-pencil" size="small" v-bind="attrs" variant="text" @click="dialog = true"></v-btn>
      </span>
    </template>

    <v-card>
      <v-card-title class="text-h5 grey lighten-2">{{ characterName }}のプレイヤー変更</v-card-title>

      <v-card-item>
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

      <v-card-text class="text-body-2"> 設定した秘密情報がこのプレイヤーから見えるようになります。 </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="submit()">確定</v-btn>
        <v-btn color="primary" text @click="dialog = false">キャンセル</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const players = computed(() => [{ id: '', name: 'なし' }, ...graphQlStore.state.players] || [])
const playerName = computed(() => players.value.find(p => p.id === props.player)?.name || '')

const dialog = ref(false)

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
