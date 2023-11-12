<template>
  <pane-frame title="データ閲覧ツール">
    <template v-slot:title-action>
      <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn variant="text" v-bind="props" class="pl-1 pr-2">
            <v-icon icon="mdi-triangle-small-down" />
            表示制御
          </v-btn>
        </template>
        <div style="background-color: white; margin-top: -2px" class="pr-2 border-s border-e border-b border-t">
          <v-defaults-provider
            :defaults="{
              VSwitch: {
                color: 'primary',
                density: 'compact',
                hideDetails: true,
                class: 'pl-3',
                inset: true,
                trueIcon: 'mdi-check'
              }
            }"
          >
            <v-switch label="背景" v-model="viewBackground" />
            <v-switch label="特技表" v-model="viewTokugi" />
            <v-switch label="忍法一覧" v-model="viewNinpou" />
            <v-divider class="my-1 ml-2" />
            <v-switch label="タブ欄" v-model="viewText" />
            <v-label class="text-body-2 ml-4">タブ欄高さ</v-label>
            <v-slider
              density="compact"
              class="ml-4"
              :hide-details="true"
              v-model="textRows"
              :rounded="true"
              color="primary"
              :thumb-label="true"
              :min="2"
              :step="1"
              :max="20"
            />
          </v-defaults-provider>
        </div>
      </v-menu>
    </template>
    <template v-slot:layout></template>
    <template v-slot:default>
      <template v-for="(cw, idx) in characterWraps" :key="cw.id">
        <v-divider v-if="idx" />
        <data-view-card
          :character-id="cw.data.id"
          :player-id="cw.data.player"
          :view-pass="cw.data.viewPass"
          :character-sheet="cw.data.character"
          :background-view="viewBackground"
          :ninpou-view="viewNinpou"
          :tokugi-view="viewTokugi"
          :text-view="viewText"
          :text-rows="textRows"
          v-model:select-skill="selectSkill"
        />
      </template>
      <span v-if="!characterWraps.length" class="ma-3">
        0件<br />
        キャラクターシートを登録してください。
      </span>
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
import { computed, inject, ref, watch } from 'vue'
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import DataViewCard from '@/components/panes/Shinobigami/DataViewCard.vue'

import { CharacterWrap, GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
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
const viewTokugi = ref(true)
const viewText = ref(true)
const textRows = ref(10)

const isUserControl = computed(() => Boolean(graphQlStore?.state.user?.token))

const characterWraps = computed<CharacterWrap[]>(() => {
  if (!graphQlStore) return []
  if (isUserControl.value)
    return graphQlStore.state.sessionDataList
      .filter(sd => sd.type === 'shinobigami-handout')
      .map(sd => graphQlStore.state.sessionDataList.find(sdc => sdc.id === sd.data.person))
      .filter(sd => Boolean(sd))
  return graphQlStore.state.sessionDataList
    .filter(sd => sd.type === 'shinobigami-handout' && sd.data.published)
    .map(sd => graphQlStore.state.sessionDataList.find(sdc => sdc.id === sd.data.person))
    .filter(sd => Boolean(sd))
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
  :deep(.v-field__append-inner),
  :deep(.v-text-field__prefix),
  :deep(.v-field__input) {
    padding-top: 0;
    min-height: auto;
  }
}
</style>
