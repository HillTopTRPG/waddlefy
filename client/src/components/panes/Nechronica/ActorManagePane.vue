<template>
  <pane-frame title="役者管理ツール">
    <template #title-action></template>
    <template #layout>
      <v-sheet class="d-flex flex-row flex-wrap w-100 pa-1" style="gap: 0.1rem" v-if="!perspective">
        <url-form-menu text="ドール読込" @execute="onLoadCharacterSheet" :tips="[]" />
      </v-sheet>
    </template>
    <template #default>
      <v-sheet class="d-flex flex-row flex-wrap w-100 px-2" style="gap: 0.5rem">
        <template v-for="character in characters" :key="character.id">
          <v-card variant="elevated" rounded="lg" class="">
            <v-card-title class="bg-amber text-body-1 d-flex flex-row justify-start align-center">
              <span class="ellipsis flex-grow-1" style="width: 1em">{{
                character.data.character.basic.characterName
              }}</span>
              <link-btn :href="character.data.character.url" />
            </v-card-title>
            <v-card-text class="py-1 px-2 d-flex flex-column flex-wrap align-end" style="gap: 0.3rem">
              <menu-edit-text-field
                :editable="true"
                variant="solo-filled"
                :width="18"
                icon="mdi-tag-text-outline"
                label="ドール名"
                :text="character.data.character.basic.characterName"
              />
              <reload-character-sheet-btn :character-id="character.id" />
              <delete-menu-btn
                :target-name="character.data.character.basic.characterName"
                type="ドール"
                location="bottom center"
                @execute="() => graphQlStore?.deleteSessionData(character.id)"
              />
            </v-card-text>
          </v-card>
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

import DeleteMenuBtn from '@/components/DeleteMenuBtn.vue'
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ReloadCharacterSheetBtn from '@/components/panes/Nechronica/ReloadCharacterSheetBtn.vue'
import UrlFormMenu from '@/components/panes/Nechronica/UrlFormMenu.vue'
import {
  Nechronica,
  NechronicaHelper
} from '@/components/panes/Nechronica/nechronica'
import LinkBtn from '@/components/parts/LinkBtn.vue'
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'
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

const characters = computed((): { id: string; data: { player: string; character: Nechronica } }[] => {
  return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'nechronica-character') || []
})

async function onLoadCharacterSheet(url: string) {
  const helper = new NechronicaHelper(url)
  if (helper.isThis()) {
    const { data } = await helper.getData()
    if (!data) {
      graphQlStore?.addNotification('キャラクターシートの読込に失敗しました。', 'mdi-alert-circle-outline', 'error')
      return
    }
    console.log(JSON.stringify(data, null, 2))
    await graphQlStore?.addNechronicaCharacter(perspective.value, data)
  }
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
$title-height: 2rem;

.sticky-title {
  position: sticky;
  top: 0;
  height: $title-height;
  box-sizing: border-box;
  padding-top: 0;
  padding-bottom: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  z-index: 2;
}
.sticky-subtitle {
  position: sticky;
  top: $title-height;
  z-index: 1;
  opacity: 1;
}
</style>
