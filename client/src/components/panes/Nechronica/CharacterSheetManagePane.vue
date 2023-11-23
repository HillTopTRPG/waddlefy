<template>
  <pane-frame title="キャラクターシート管理ツール">
    <template #title-action>
      <v-btn
        :icon="nav ? 'mdi-menu-close' : 'mdi-menu-open'"
        size="small"
        density="comfortable"
        variant="text"
        @click="
          () => {
            nav = !nav
          }
        "
      />
    </template>
    <template #layout>
      <v-sheet class="d-flex flex-row flex-wrap w-100 pa-1" style="gap: 0.1rem" v-if="!perspective">
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
      </v-sheet>
    </template>
    <template #default>
      <v-sheet class="d-flex flex-row flex-wrap align-start px-2 overflow-auto" style="gap: 0.5rem" :style="nav ? 'padding-right: 250px !important;' : ''">
        <template v-for="character in characters" :key="character.id">
          <nechronica-character-sheet-view
            :view-lost="viewLost"
            :view-used="viewUsed"
            :view-timings="selectedTimings"
            :view-types="selectedTypes"
            :view-basic-parts="viewBasicParts"
            :character-id="character.id"
            :view-label="viewLabel"
          />
        </template>
      </v-sheet>
    </template>
  </pane-frame>
  <v-navigation-drawer location="right" v-model="nav" width="250" class="mt-8" :scrim="false" style="z-index: 10000000">
    <v-list class="h-100 py-0" style="contain: paint; overflow: scroll">
      <v-defaults-provider :defaults="{ VListSubheader: { class: 'bg-amber-lighten-4' } }">
        <v-sheet>
          <v-list-subheader>下部ラベル</v-list-subheader>
          <v-list-item class="py-1">
            <v-defaults-provider :defaults="{ VRadioGroup: { density: 'compact', hideDetails: true, inline: false } }">
              <v-radio-group class="flex-grow-0 mr-2" v-model="viewLabel">
                <template v-for="select in viewLabelSelections" :key="select.value">
                  <v-radio :value="select.value">
                    <template v-slot:label>
                      <span class="text-body-1 font-weight-bold">{{ select.label }}</span>
                    </template>
                  </v-radio>
                </template>
              </v-radio-group>
            </v-defaults-provider>
          </v-list-item>
        </v-sheet>
        <v-sheet>
          <v-list-subheader>状態</v-list-subheader>
          <v-list-item class="py-1">
            <v-switch-compact label="損傷" v-model="viewLost" color="error" />
            <v-switch-compact label="使用済" v-model="viewUsed" />
          </v-list-item>
        </v-sheet>
        <v-sheet>
          <v-list-subheader class="position-sticky" style="top: 0; z-index: 1">
            <v-sheet class="d-flex flex-row align-center bg-transparent">
              <span>表示カテゴリ</span>
              <v-switch-compact
                label="全部"
                :indeterminate="allType === 1"
                :model-value="allType > 0"
                @update:model-value="updateTypeAll()"
                @update:indeterminate="updateTypeAll()"
              />
            </v-sheet>
          </v-list-subheader>
          <v-list-item class="py-0">
            <template v-for="select in typeSelection" :key="select.value">
              <v-switch-compact :label="select.text" :value="select.value" :color="select.color" v-model="selectedTypes" />
            </template>
          </v-list-item>
        </v-sheet>
        <v-sheet>
          <v-list-subheader class="position-sticky" style="top: 0; z-index: 1">
            <v-sheet class="d-flex flex-row align-center bg-transparent">
              <span>表示タイミング</span>
              {{ allTiming }}
              {{ allTiming > 0 }}
              <v-switch-compact
                label="全部"
                :indeterminate="allTiming === 1"
                :model-value="allTiming > 0"
                @update:model-value="updateTimingAll()"
                @update:indeterminate="updateTimingAll()"
              />
            </v-sheet>
          </v-list-subheader>
          <v-list-item class="py-0">
            <template v-for="select in timingSelection" :key="select.value">
              <v-switch-compact :label="select.text" :value="select.value" v-model="selectedTimings" />
            </template>
          </v-list-item>
        </v-sheet>
      </v-defaults-provider>
    </v-list>
  </v-navigation-drawer>
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
import { NechronicaHelper, NechronicaPowerList, NechronicaTimingList } from '@/components/panes/Nechronica/nechronica'
import VSwitchCompact from '@/components/parts/VSwitchCompact.vue'
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
  { value: 'timing', label: 'タイミング' },
  { value: 'cost', label: 'コスト' },
  { value: 'range', label: '射程' }
]

const viewLost = ref(true)
const viewUsed = ref(true)
const viewBasicParts = ref(true)
const selectedTimings = ref<number[]>(NechronicaTimingList.map((_, idx) => idx))
const selectedTypes = ref<number[]>(NechronicaPowerList.map((_, idx) => idx))
const allTiming = computed((): number => {
  if (!selectedTimings.value.length) return 0
  return selectedTimings.value.length === NechronicaTimingList.length ? 2 : 1
})
const allType = computed((): number => {
  if (!selectedTypes.value.length) return 0
  return selectedTypes.value.length === NechronicaPowerList.length ? 2 : 1
})
function updateTimingAll() {
  console.log(allTiming.value)
  if (allTiming.value < 2) {
    selectedTimings.value = NechronicaTimingList.map((_, idx) => idx)
  } else {
    selectedTimings.value = []
  }
}
function updateTypeAll() {
  console.log(allType.value)
  if (allType.value < 2) {
    selectedTypes.value = NechronicaPowerList.map((_, idx) => idx)
  } else {
    selectedTypes.value = []
  }
}
const timingSelection = computed((): { value: number; text: string }[] => {
  return NechronicaTimingList.map((t, idx) => ({ value: idx, text: t }))
})
const typeSelection = computed((): { value: number; text: string }[] => {
  return NechronicaPowerList.map((t, idx) => ({ value: idx, text: t.text || '空欄', color: t.color }))
})

const characters = computed(() => {
  return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'nechronica-character')
})

const nav = ref(false)

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
