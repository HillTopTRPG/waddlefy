<template>
  <pane-frame title="特技比較ツール">
    <template #title-action>
      <v-defaults-provider :defaults="{ VSelect: { variant: 'plain', hideDetails: true, class: 'menu-select' } }">
        <v-select prefix="比較数: " :items="[2, 3, 4, 5, 6]" style="max-width: 6.5em" v-model="nums">
          <template #prepend-inner>
            <v-icon icon="mdi-triangle-small-down" />
          </template>
        </v-select>
        <v-select prefix="忍法表示: " :items="['なし', 'あり']" style="max-width: 8em" v-model="viewNinpou">
          <template #prepend-inner>
            <v-icon icon="mdi-triangle-small-down" />
          </template>
          <template #selection="{ item }">
            <span style="white-space: nowrap">{{ item.value }}</span>
          </template>
        </v-select>
      </v-defaults-provider>
    </template>
    <template #default>
      <v-defaults-provider :defaults="{ VSelect: vSelectDefaults }">
        <template v-for="i in [...Array(nums)].map((_, j) => j)" :key="i">
          <v-sheet class="pa-1 overflow-auto align-start">
            <v-select :prefix="`キャラクター${i + 1}: `" v-model="selectCharacters[i]" />
            <speciality-table
              :info="characterWraps.find(cw => cw.id === selectCharacters[i])?.character.skill || undefined"
              :perspective="perspective"
              v-model:select-skill="selectSkill"
              @update:info="v => updateInfo(selectCharacters[i], v)"
              :editing="false"
              :editable="false"
            />
            <ninpou-table
              v-if="viewNinpou === 'あり'"
              :perspective="perspective"
              :list="characterWraps.find(cw => cw.id === selectCharacters[i])?.character.ninjaArtsList"
              @click-skill="
                v => {
                  selectSkill = v === selectSkill ? '' : v
                }
              "
            />
          </v-sheet>
        </template>
      </v-defaults-provider>
    </template>
  </pane-frame>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name: 'SpecialityTableDiffPane',
  label: '特技比較'
}
</script>

<script setup lang="ts">
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import SpecialityTable from '@/components/panes/Shinobigami/SpecialityTable.vue'
import { computed, inject, ref, watch } from 'vue'

import { CharacterWrap, GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import NinpouTable from '@/components/panes/Shinobigami/NinpouTable.vue'
import { clone } from '@/components/panes/Shinobigami/PrimaryDataUtility'
import { SaikoroFictionTokugi } from '@/components/panes/Shinobigami/SaikoroFiction'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const characterWraps = computed<CharacterWrap[]>(() => {
  if (!graphQlStore) return []
  return graphQlStore.state.sessionDataList
    .filter(sd => sd.type === 'shinobigami-character' && sd.data?.character)
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

const perspective = ref('')

const vSelectDefaults = {
  density: 'compact',
  variant: 'plain',
  hideDetails: true,
  itemValue: 'id',
  itemTitle: 'character.characterName',
  singleLine: true,
  active: true,
  class: 'character-select',
  placeholder: '未選択',
  items: characterWraps.value
}

const selectCharacters = ref<(string | null)[]>([null, null])
const nums = ref(2)
watch(nums, v => {
  for (let i = v; i > selectCharacters.value.length; ) selectCharacters.value.push(null)
  for (let i = v; i < selectCharacters.value.length; ) selectCharacters.value.splice(i, 1)
})

const viewNinpou = ref('なし')

const selectSkill = ref('')

async function updateInfo(id: string, info: SaikoroFictionTokugi) {
  if (!graphQlStore) return
  const characterSheet = clone(characterWraps.value.find(cw => cw.id === id))
  if (!characterSheet) return
  characterSheet.skill = info
  await graphQlStore.updateShinobigamiCharacter(
    id,
    characterSheet.player,
    characterSheet.viewPass,
    characterSheet.character
  )
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.character-select {
  max-width: 30em;

  :deep(.v-field__append-inner),
  :deep(.v-text-field__prefix),
  :deep(.v-field__input) {
    padding-top: 0;
    min-height: auto;
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
