<template>
  <pane-frame title="キャラクターシート管理ツール">
    <template v-slot:title-action> </template>
    <template v-slot:layout>
      <v-sheet class="d-flex flex-row flex-wrap w-100 pa-2" style="gap: 0.1rem">
        <add-shinobigami-character-sheet-menu />
      </v-sheet>
    </template>
    <template v-slot:default>
      <v-sheet class="w-100 d-flex flex-row align-start justify-start flex-wrap px-0">
        <scenario-data-card v-for="cw in characterWraps" :key="cw.id" :data-id="cw.id" :text-rows="textRows" />
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

const characterWraps = computed<CharacterWrap[]>(() => {
  if (!graphQlStore) return []
  return graphQlStore.state.sessionDataList
    .filter(sd => sd.type === 'shinobigami-character' && sd.data?.character)
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
