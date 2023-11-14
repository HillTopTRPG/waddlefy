<template>
  <pane-frame title="キャラクターシート管理ツール">
    <template v-slot:title-action>
      <v-menu :close-on-content-click="false" v-if="isUserControl">
        <template v-slot:activator="{ props }">
          <v-btn variant="text" v-bind="props" class="pl1 pr-2">
            <v-icon icon="mdi-triangle-small-down" />
            {{ perspectiveList.find(p => p.value === perspective)?.name || '' }}視点
          </v-btn>
        </template>
        <v-defaults-provider :defaults="{ VSelect: { density: 'compact', variant: 'solo' } }">
          <v-select label="視点" :items="perspectiveList" item-title="name" item-value="value" v-model="perspective" />
        </v-defaults-provider>
      </v-menu>
    </template>
    <template v-slot:layout>
      <v-sheet class="d-flex flex-row flex-wrap w-100 pa-2" style="gap: 0.1rem">
        <add-shinobigami-character-sheet-menu />
      </v-sheet>
    </template>
    <template v-slot:default>
      <v-sheet class="w-100 d-flex flex-row align-start justify-start flex-wrap px-0">
        <template v-for="cw in characterWraps" :key="cw.id">
          <scenario-data-card mode="edit" :data-id="cw.id" :text-rows="textRows" :perspective="perspective" />
        </template>
      </v-sheet>
    </template>
  </pane-frame>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name: 'CharacterSheetManagePane',
  label: 'キャラクターシート管理'
}
</script>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'

import { CharacterWrap, GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ScenarioDataCard from '@/components/panes/Shinobigami/ScenarioDataCard.vue'
import AddShinobigamiCharacterSheetMenu from '@/components/panes/Shinobigami/AddShinobigamiCharacterSheetMenu.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const isUserControl = computed(() => Boolean(graphQlStore?.state.user?.token))

const perspectiveList = computed(() => [
  { value: '', name: '主催者' },
  ...(graphQlStore?.state.players.map(p => ({ value: p.id, name: p.name })) || [])
])

const perspective = ref(isUserControl.value ? '' : graphQlStore?.state.player?.id || '')

const characterWraps = computed<CharacterWrap[]>(() => {
  if (!graphQlStore) return []
  if (!perspective.value) {
    return graphQlStore.state.sessionDataList
      .filter(sd => sd.type === 'shinobigami-character')
      .map(sd => sd.data as CharacterWrap)
  }
  return graphQlStore.state.sessionDataList
    .filter(sd => sd.type === 'shinobigami-character' && (!sd.data.player || sd.data.player === perspective.value))
    .map(sd => sd.data as CharacterWrap)
})

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

// eslint-disable-next-line unused-imports/no-unused-vars
const emits = defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
}>()

const textRows = ref(3)
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
