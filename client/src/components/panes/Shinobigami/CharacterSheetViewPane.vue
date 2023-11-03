<template>
  <pane-frame title="キャラクターシート表示">
    <template v-slot:title-action>
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
</style>
