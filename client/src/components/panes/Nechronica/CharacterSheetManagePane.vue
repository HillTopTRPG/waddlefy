<template>
  <pane-frame title="キャラクターシート管理ツール">
    <template #title-action>
      <v-menu :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn variant="text" v-bind="props" class="pl-1 pr-2">
            <v-icon icon="mdi-triangle-small-down" />
            表示制御
          </v-btn>
        </template>
        <div style="background-color: white; margin-top: -2px" class="pr-2 border-s border-e border-b border-t">
          <v-label class="text-body-2 ml-4">テキスト行数</v-label>
          <v-defaults-provider :defaults="{ VSlider: { density: 'compact', hideDetails: true, min: 2, step: 1 } }">
            <v-slider class="ml-4" :hide-details="true" v-model="textRows" :max="20" />
          </v-defaults-provider>
        </div>
      </v-menu>
    </template>
    <template #layout>
      <v-sheet class="d-flex flex-row flex-wrap w-100 px-2 pa-2" style="gap: 0.1rem" v-if="!perspective">
        <nechronica-url-form-menu
          text="キャラクターシート読込"
          @execute="onLoadCharacterSheet"
          :tips="[
            '公開中のシナリオシートを使う場合、閲覧することで秘匿情報閲覧パスがわかります。',
            '$b$PC$b$と$b$NPC$b$と$b$腹心$b$はWaddlefy上ではハンドアウトの一種として扱います。',
            '$b$PC$b$の推奨と$b$NPC$b$の概要は読み込みません。\n必要な場合は共有メモを使ってください。',
            '読み込み後は、$b$エニグマ$b$の偽装と解除条件の追記をお忘れなく！',
            '$b$プライズ$b$は名前だけ使って読み込みます。\n読込直後は非公開状態です。'
          ]"
        />
        <v-divider :vertical="true" />
        <v-radio-group density="compact" :hide-details="true" :inline="true" v-model="viewLabel">
          <template v-for="select in viewLabelSelections" :key="select.value">
            <v-radio :value="select.value" :label="select.label" />
          </template>
        </v-radio-group>
      </v-sheet>
    </template>
    <template #default>
      <v-sheet class="d-flex flex-row flex-wrap align-start px-2 overflow-auto" style="gap: 0.5rem">
        <template v-for="character in characters" :key="character.id">
          <nechronica-character-sheet-view :character-id="character.id" :view-label="viewLabel" />
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
  name: 'CharacterSheetManagerPane',
  label: 'キャラクターシート管理'
}
</script>

<script setup lang="ts">
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import { computed, inject, ref } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import NechronicaCharacterSheetView from '@/components/panes/Nechronica/NechronicaCharacterSheetView.vue'
import NechronicaUrlFormMenu from '@/components/panes/Nechronica/NechronicaUrlFormMenu.vue'
import { NechronicaHelper } from '@/components/panes/Nechronica/nechronica'
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
const viewLabel = ref('')
const textRows = ref(3)

const viewLabelSelections = [
  { value: '', label: 'なし' },
  { value: 'timing', label: 'T' },
  { value: 'cost', label: 'C' },
  { value: 'range', label: 'R' }
]

const characters = computed(() => {
  return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'nechronica-character')
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
<style lang="scss" scoped></style>
