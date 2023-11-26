<template>
  <pane-frame title="役者閲覧ツール">
    <template #title-action>
      <v-btn :append-icon="nav ? 'mdi-menu-close' : 'mdi-menu-open'" size="small" variant="text" @click="onChangeNav">
        <span class="text-decoration-underline">表示制御</span>
      </v-btn>
    </template>
    <template #layout> </template>
    <template #default>
      <v-sheet
        class="d-flex flex-row flex-wrap align-start pa-2 overflow-auto"
        style="gap: 0.5rem"
        :style="nav ? 'padding-right: 250px !important;' : ''"
      >
        <template v-for="character in characters" :key="character.id">
          <character-sheet-view :character-id="character.id" :view-option="viewOption" />
        </template>
      </v-sheet>
    </template>
    <template #nav>
      <view-option-nav v-model:nav="nav" v-model:option="viewOption" />
    </template>
  </pane-frame>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name: 'ActorViewPane',
  label: '役者閲覧'
}
</script>

<script setup lang="ts">
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import { computed, inject, ref } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import CharacterSheetView from '@/components/panes/Nechronica/CharacterSheetView.vue'
import ViewOptionNav, { NechronicaViewOption } from '@/components/panes/Nechronica/ViewOptionNav.vue'
import { Nechronica, NechronicaPowerList, NechronicaTimingList } from '@/components/panes/Nechronica/nechronica'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

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

const viewOption = ref<NechronicaViewOption>({
  mode: 'view',
  roicePosition: 'before',
  viewLost: true,
  viewUsed: true,
  viewLabel: '',
  selectedTypes: NechronicaPowerList.map((_, idx) => idx),
  selectedTimings: NechronicaTimingList.map((_, idx) => idx)
})

const characters = computed((): { id: string; data: { player: string; character: Nechronica } }[] => {
  return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'nechronica-character') || []
})

const nav = ref(false)
function onChangeNav() {
  nav.value = !nav.value
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
