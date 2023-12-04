<template>
  <pane-frame title="役者管理ツール">
    <template #title-action></template>
    <template #layout>
      <v-sheet class="d-flex flex-row flex-wrap w-100 pa-2" style="gap: 0.3rem" v-if="!perspective">
        <template v-for="type in nechronicaTypes" :key="type">
          <url-form-menu
            v-if="!perspective || type === 'doll'"
            :text="`${NechronicaTypeColorMap.find(t => t.type === type)?.text || ''}読込`"
            :color="NechronicaTypeColorMap.find(t => t.type === type)?.color || ''"
            @execute="url => onLoadCharacterSheet(url, type)"
            :tips="[]"
          />
        </template>
      </v-sheet>
    </template>
    <template #default>
      <v-sheet class="d-flex flex-row flex-wrap align-start w-100 px-2" style="gap: 0.5rem">
        <template v-for="character in characters.filter(c => c.data.type === 'doll')" :key="character.id">
          <manage-character-sheet-card :character="character" />
        </template>
        <template v-for="character in characters.filter(c => c.data.type === 'servent')" :key="character.id">
          <manage-character-sheet-card :character="character" />
        </template>
        <template v-for="character in characters.filter(c => c.data.type === 'legion')" :key="character.id">
          <manage-character-sheet-card :character="character" />
        </template>
        <template v-for="character in characters.filter(c => c.data.type === 'horror')" :key="character.id">
          <manage-character-sheet-card :character="character" />
        </template>
      </v-sheet>
    </template>
    <template #nav></template>
  </pane-frame>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name: 'ActorManagePane',
  label: '役者管理'
}
</script>

<script setup lang="ts">
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import { computed, inject, ref } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ManageCharacterSheetCard from '@/components/panes/Nechronica/character/ManageCharacterSheetCard.vue'
import UrlFormMenu from '@/components/panes/Nechronica/component/UrlFormMenu.vue'
import {
  NechronicaHelper,
  NechronicaType,
  NechronicaTypeColorMap,
  NechronicaWrap
} from '@/components/panes/Nechronica/nechronica'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const isUserControl = computed(() => Boolean(graphQlStore?.state.user?.token))

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

const perspective = ref(isUserControl.value ? '' : graphQlStore?.state.player?.id || '')

const characters = computed((): { id: string; data: NechronicaWrap }[] => {
  return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'nechronica-character') || []
})

async function onLoadCharacterSheet(url: string, type: NechronicaType) {
  const helper = new NechronicaHelper(url)
  if (helper.isThis()) {
    const { data } = await helper.getData()
    if (!data) {
      graphQlStore?.addNotification('キャラクターシートの読込に失敗しました。', 'mdi-alert-circle-outline', 'error')
      return
    }
    console.log(JSON.stringify(data, null, 2))
    await graphQlStore?.addNechronicaCharacter(perspective.value, type, data, {})
  }
}

const nechronicaTypes: NechronicaType[] = ['doll', 'legion', 'horror', 'servent']
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
