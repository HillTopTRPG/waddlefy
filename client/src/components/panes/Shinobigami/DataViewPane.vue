<template>
  <pane-frame title="データ閲覧ツール">
    <template v-slot:title-action>
      <v-defaults-provider :defaults="{ VSelect: { variant: 'plain', hideDetails: true, class: 'menu-select' } }">
        <v-select prefix="視点:" :items="perspectiveList" item-title="name" item-value="value" v-model="perspective">
          <template v-slot:prepend-inner>
            <v-icon icon="mdi-triangle-small-down" />
          </template>
        </v-select>
      </v-defaults-provider>

      <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn variant="text" v-bind="props" class="pl-1 pr-2">
            <v-icon icon="mdi-triangle-small-down" />
            表示制御
          </v-btn>
        </template>
        <div style="background-color: white; margin-top: -2px" class="pr-2 border-s border-e border-b border-t">
          <v-defaults-provider :defaults="{ VSwitch: { density: 'compact', hideDetails: true, class: 'pl-3' } }">
            <v-switch label="背景" color="primary" true-icon="mdi-check" v-model="viewBackground" />
            <v-switch label="特技表" color="primary" true-icon="mdi-check" v-model="viewTokugi" />
            <v-switch label="忍法一覧" color="primary" true-icon="mdi-check" v-model="viewNinpou" />
            <v-switch label="奥義一覧" color="primary" true-icon="mdi-check" v-model="viewSpecialArts" />
            <v-divider class="my-1 ml-2" />
            <v-switch label="タブ欄" color="primary" true-icon="mdi-check" v-model="viewText" />
            <v-label class="text-body-2 ml-4">タブ欄高さ</v-label>
          </v-defaults-provider>
          <v-defaults-provider :defaults="{ VSlider: { density: 'compact', hideDetails: true, min: 2, step: 1 } }">
            <v-slider class="ml-4" v-model="textRows" :rounded="true" color="primary" :thumb-label="true" :max="20" />
          </v-defaults-provider>
        </div>
      </v-menu>
    </template>
    <template v-slot:layout></template>
    <template v-slot:default>
      <template v-for="(cw, idx) in handoutDataList" :key="cw.id">
        <v-divider v-if="idx" />
        <data-view-card
          :character-id="cw.characterId"
          :scenario-data-id="cw.scenarioDataId"
          :background-view="viewBackground"
          :ninpou-view="viewNinpou"
          :special-arts-view="viewSpecialArts"
          :tokugi-view="viewTokugi"
          :text-view="viewText"
          :text-rows="textRows"
          :perspective="perspective"
          v-model:select-skill="selectSkill"
        />
      </template>
      <span v-if="!handoutDataList.length" class="ma-3">
        0件<br />
        ハンドアウトを登録してください。
      </span>
      <v-sheet class="d-flex flex-row flex-wrap justify-start align-start w-100" style="gap: 0">
        <v-divider class="mb-2" />
        <template v-for="enigma in enigmaList" :key="enigma.id">
          <scenario-data-card mode="view" :data-id="enigma.id" :text-rows="textRows" :perspective="perspective" />
        </template>
        <template v-for="prize in prizeList" :key="prize.id">
          <scenario-data-card mode="view" :data-id="prize.id" :text-rows="textRows" :perspective="perspective" />
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
  name: 'CharacterSheetViewPane',
  label: 'データ閲覧'
}
</script>

<script setup lang="ts">
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import DataViewCard from '@/components/panes/Shinobigami/DataViewCard.vue'
import { computed, inject, ref, watch } from 'vue'

import { CharacterWrap, GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import { SessionData } from '@/components/graphql/schema'
import ScenarioDataCard from '@/components/panes/Shinobigami/ScenarioDataCard.vue'
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

const navigationDrawer = ref(false)
watch(navigationDrawer, v => {
  if (v) selectSkill.value = ''
})

const viewBackground = ref(true)
const viewNinpou = ref(true)
const viewSpecialArts = ref(true)
const viewTokugi = ref(true)
const viewText = ref(true)
const textRows = ref(10)

const isUserControl = computed(() => Boolean(graphQlStore?.state.user?.token))

const perspectiveList = computed(() => [
  { value: '', name: '主催者' },
  ...(graphQlStore?.state.players.map(p => ({ value: p.id, name: p.name })) || [])
])

const perspective = ref(isUserControl.value ? '' : graphQlStore?.state.player?.id || '')

const handoutDataList = computed<{ characterId?: string; scenarioDataId?: string }[]>(() => {
  if (!graphQlStore) return [] as SessionData<CharacterWrap>[]
  if (!perspective.value)
    return graphQlStore.state.sessionDataList
      .filter(sd => sd.type === 'shinobigami-handout')
      .map(sd => {
        const character = graphQlStore.state.sessionDataList.find(sdc => sdc.id === sd.data.person)
        return {
          characterId: character?.id,
          scenarioDataId: character ? undefined : sd.id
        }
      })
  return graphQlStore.state.sessionDataList
    .filter(sd => sd.type === 'shinobigami-handout' && sd.data.published)
    .map(sd => {
      const character = graphQlStore.state.sessionDataList.find(sdc => sdc.id === sd.data.person)
      return {
        characterId: character?.id,
        scenarioDataId: character ? undefined : sd.id
      }
    })
})

const enigmaList = computed(() => {
  return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-enigma')
})

const prizeList = computed(() => {
  if (!perspective.value) {
    return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-prize')
  }
  return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-prize')
})

const selectSkill = ref('')
watch(selectSkill, v => {
  if (v) navigationDrawer.value = false
})

const tokugiTableEditing = ref(false)
watch(tokugiTableEditing, v => console.log(v))
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.notify-snackbar {
  :deep(.v-snackbar__wrapper) {
    border-radius: 0;
  }
}

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
