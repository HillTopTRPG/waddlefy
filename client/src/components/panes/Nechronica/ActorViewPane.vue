<template>
  <pane-frame title="役者閲覧ツール">
    <template #title-action>
      <v-btn :append-icon="nav ? 'mdi-menu-close' : 'mdi-menu-open'" size="small" variant="text" @click="onChangeNav">
        <span class="text-decoration-underline">表示制御</span>
      </v-btn>
    </template>
    <template #layout>
      <v-sheet class="d-flex flex-row flex-wrap w-100 pa-1" style="gap: 0.1rem" v-if="!perspective">
        <url-form-menu
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
      </v-sheet>
    </template>
    <template #default>
      <v-sheet
        class="d-flex flex-row flex-wrap align-start px-2 overflow-auto"
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
import UrlFormMenu from '@/components/panes/Nechronica/UrlFormMenu.vue'
import ViewOptionNav, { NechronicaViewOption } from '@/components/panes/Nechronica/ViewOptionNav.vue'
import { NechronicaHelper, NechronicaPowerList, NechronicaTimingList } from '@/components/panes/Nechronica/nechronica'
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

const viewOption = ref<NechronicaViewOption>({
  roicePosition: 'before',
  viewLost: true,
  viewUsed: true,
  viewLabel: '',
  selectedTypes: NechronicaPowerList.map((_, idx) => idx),
  selectedTimings: NechronicaTimingList.map((_, idx) => idx)
})

const characters = computed(() => {
  return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'nechronica-character')
})

const nav = ref(false)
function onChangeNav() {
  nav.value = !nav.value
}

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
