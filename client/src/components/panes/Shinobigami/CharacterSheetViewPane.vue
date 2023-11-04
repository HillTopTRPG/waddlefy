<template>
  <pane-frame title="キャラクターシート表示">
    <template v-slot:title-action>
      <v-defaults-provider
        :defaults="{
          VSelect: {
            variant: 'plain',
            density: 'compact',
            hideDetails: true,
            class: 'menu-select ml-5'
          }
        }"
      >
        <v-menu :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn variant="text" v-bind="props" class="pl-1 pr-2">
              <v-icon icon="mdi-triangle-small-down" />
              表示制御
            </v-btn>
          </template>
          <div style="background-color: white; margin-top: -2px" class="pr-2 border-s border-e border-b border-t">
            <v-checkbox-btn label="忍法一覧" v-model="viewNinpou" />
            <v-checkbox-btn label="特技表" v-model="viewTokugi" />
            <v-divider class="my-1 ml-2" />
            <v-label class="text-body-2 ml-2">テキスト行数</v-label>
            <v-slider density="compact" class="ml-3" v-model="textRows" :min="2" :step="1" :max="20" />
          </div>
        </v-menu>
      </v-defaults-provider>
      <v-btn
        size="x-small"
        variant="text"
        class="bg-transparent"
        icon="mdi-menu"
        @click="navigationDrawer = !navigationDrawer"
      />
    </template>
    <template v-slot:layout>
      <v-navigation-drawer
        width="200"
        class="mt-8"
        :scrim="false"
        elevation="0"
        border
        location="right"
        style="border-top: none; z-index: 10000000"
        v-model="navigationDrawer"
      >
        <v-list>
          <template v-for="cw in characterWraps" :key="cw.id">
            <v-list-item>{{ cw.character.characterName }}</v-list-item>
          </template>
        </v-list>
      </v-navigation-drawer>
    </template>
    <template v-slot:default>
      <character-sheet-view
        v-for="cw in characterWraps"
        :key="cw.id"
        :character-id="cw.id"
        :player-id="cw.player"
        :character-sheet="cw.character"
        :ninpou-view="viewNinpou"
        :tokugi-view="viewTokugi"
        :text-rows="textRows"
        v-model:select-skill="selectSkill"
      />
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
  label: 'キャラクターシート表示'
}
</script>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import CharacterSheetView from '@/components/panes/Shinobigami/CharacterSheetView.vue'

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

const viewNinpou = ref(true)
const viewTokugi = ref(true)
const textRows = ref(10)

function getCharacterWraps(): CharacterWrap[] {
  return graphQlStore.state.sessionDataList
    .filter(sd => sd.type === 'character' && sd.data?.character)
    .map(sd => sd.data as CharacterWrap)
}

const characterWraps = computed<CharacterWrap[]>(() => {
  if (!graphQlStore) return []
  return getCharacterWraps()
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
