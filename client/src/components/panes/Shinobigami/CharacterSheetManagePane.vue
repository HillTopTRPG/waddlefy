<template>
  <pane-frame title="キャラクターシート管理ツール">
    <template #title-action>
      <template v-if="isUserControl">
        <v-defaults-provider :defaults="{ VSelect: { variant: 'plain', hideDetails: true, class: 'menu-select' } }">
          <v-select prefix="視点:" :items="perspectiveList" item-title="name" item-value="value" v-model="perspective">
            <template #prepend-inner>
              <v-icon icon="mdi-triangle-small-down" />
            </template>
          </v-select>
        </v-defaults-provider>
      </template>
    </template>
    <template #layout>
      <v-sheet class="d-flex flex-row flex-wrap w-100 pa-2" style="gap: 0.1rem">
        <shinobigami-url-form-menu
          text="キャラクターシート読込"
          pass-placeholder="オプション"
          @execute="onLoadCharacterSheet"
          :tips="[
            '$b$人物欄$b$は読み込みません。\n後で手動で入力してください。',
            '$b$忍具$b$は読み込みません。\nメモ欄などを使って管理してください。',
            '$b$シナリオ情報$b$は読み込みません。\nハンドアウトの追加と紐付けで表現します。',
            '秘匿情報閲覧パスは$b$奥義$b$の読込に使います。\n$b$忍具$b$は秘匿情報ですが読み込みません。'
          ]"
        />
      </v-sheet>
    </template>
    <template #default>
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
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import { computed, inject, ref } from 'vue'

import { CharacterWrap, GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ScenarioDataCard from '@/components/panes/Shinobigami/ScenarioDataCard.vue'
import { ShinobigamiHelper } from '@/components/panes/Shinobigami/shinobigami'
import ShinobigamiUrlFormMenu from '@/components/panes/Shinobigami/ShinobigamiUrlFormMenu.vue'
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

async function onLoadCharacterSheet(url: string, password: string) {
  const helper = new ShinobigamiHelper(url, password)
  if (helper.isThis()) {
    const { data } = await helper.getData()
    if (data) {
      await graphQlStore?.addShinobigamiCharacter(perspective.value, data, password)
    }
  }
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.menu-select {
  flex-grow: 0;

  :deep(.v-field__append-inner) {
    display: none;
  }
  :deep(.v-field__prepend-inner) .v-icon {
    opacity: 1 !important;
    text-align: right;
    font-size: 18px;
    margin-top: 4px;
  }
  :deep(.v-field__prepend-inner),
  :deep(.v-text-field__prefix),
  :deep(.v-field__input) {
    padding-top: 0;
    padding-left: 0;
    margin-top: 2px;
    color: black;
    font-size: 14px;
    min-height: auto;
  }
}
</style>
