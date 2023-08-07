<template>
  <pane-frame title="キャラクターシート管理">
    <template v-slot:title-action>
    </template>
    <template v-slot:layout>
    </template>
    <template v-slot:default>
      <v-text-field
        label="キャラクターシート倉庫のURL"
        color="primary"
        class="name-text-field overflow-visible"
        :hide-details="true"
        variant="outlined"
        :error-messages="addUrlErrorMessage"
        v-model="addUrl"
        @keydown.enter="$event.keyCode === 13 && addUrl && callAddCharacter()"
        @click:append-inner.stop
      >
        <template v-slot:append-inner>
          <v-divider :vertical="true" />
          <v-btn
            :disabled="Boolean(addUrlErrorMessage) || !addUrl"
            text="作成"
            variant="text"
            class="bg-transparent h-100"
            @click.prevent.stop="callAddCharacter()"
            @mousedown.prevent.stop
            @mouseup.prevent.stop
          />
        </template>
      </v-text-field>
      <v-list>
        <v-list-item
          v-for="cw in characterWraps"
          :key="cw.id"
        >
          <v-list-item-title>{{ cw.character.characterName }}</v-list-item-title>
          <v-select
            :items="players"
            item-title="name"
            item-value="id"
            :model-value="cw.player"
            @update:model-value="v => updateCharacterPlayer(cw.id, v)"
          />
        </v-list-item>
      </v-list>
    </template>
  </pane-frame>
</template>

<script lang='ts'>
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name : 'CharacterSheetManagePane',
  label: 'キャラクターシート管理',
}
</script>

<script setup lang='ts'>
import { computed, inject, ref } from 'vue'
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import { ShinobigamiHelper } from '@/components/panes/Shinobigami/shinobigami'

import { CharacterWrap, GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const characterWraps = computed<CharacterWrap[]>(() => {
  if (!graphQlStore) return []
  return graphQlStore.state.sessionDataList
    .filter(sd => sd.type === 'character' && sd.data?.character)
    .map(sd => sd.data as CharacterWrap)
})

const players = computed(() => [{ id: '', name: '解除' }, ...graphQlStore?.state.players] || [])

const props = defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

const emits = defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
}>()

const addUrl = ref('')
const addUrlErrorMessage = ref('')
async function callAddCharacter() {
  const helper = new ShinobigamiHelper(addUrl.value, '')
  if (helper.isThis()) {
    const { data } = await helper.getData()
    await graphQlStore?.addCharacter(data)
  }
}

async function updateCharacterPlayer(characterId: string, playerId: string) {
  console.log(characterId, playerId)
  await graphQlStore?.updateCharacter(
    characterId,
    playerId,
    characterWraps.value.find(cw => cw.id === characterId)?.character
  )
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang='scss' scoped>
</style>
