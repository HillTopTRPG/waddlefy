<template>
  <pane-frame title="特技表比較ツール">
    <template v-slot:title-action>
      <v-defaults-provider :defaults="{
        VSelect: { variant: 'plain', density: 'compact', hideDetails: true, class: 'menu-select ml-5' }
      }">
        <v-select prefix="比較数: " :items="[2,3,4,5,6]" style="max-width: 6em" v-model="nums" />
        <v-select prefix="忍法表示: " :items="['なし', 'あり']" style="max-width: 8em" v-model="viewNinpou" />
      </v-defaults-provider>
    </template>
    <template v-slot:default>
      <v-defaults-provider :defaults="{ VSelect: vSelectDefaults }">
        <template v-for="i in [...Array(nums)].map((_, j) => j)" :key="i">
          <v-sheet class="pa-1 overflow-auto align-start">
            <v-select :prefix="`キャラクター${i + 1}: `" v-model="selectCharacters[i]" />
            <speciality-table
              :id="`speciality-table-${i}-${selectCharacters[i] || ''}`"
              :info="characterWraps.find(cw => cw.id === selectCharacters[i])?.character.skill || undefined"
              v-model:select-skill="selectSkill"
              :editing="false"
              :editable="false"
            />
          </v-sheet>
        </template>
      </v-defaults-provider>
    </template>
  </pane-frame>
</template>

<script lang='ts'>
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name : 'SpecialityTableDiffPane',
  label: '特技表比較',
}
</script>

<script setup lang='ts'>
import { computed, inject, ref, watch } from 'vue'
import { uuid } from 'vue-uuid'
import { Layout } from '@/components/panes'
import SpecialityTable from '@/components/panes/Shinobigami/SpecialityTable.vue'
import PaneFrame from '@/components/panes/PaneFrame.vue'

import { CharacterWrap, GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const characterWraps = computed<CharacterWrap[]>(() => {
  if (!graphQlStore) return []
  return graphQlStore.state.sessionDataList
    .filter(sd => sd.type === 'character' && sd.data?.character)
    .map(sd => sd.data as CharacterWrap)
})

const props = defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

const uid = "a" + uuid.v4()

const emits = defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
}>()

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
  for (let i = v; i > selectCharacters.value.length;) selectCharacters.value.push(null)
  for (let i = v; i < selectCharacters.value.length;) selectCharacters.value.splice(i, 1)
})
watch(selectCharacters, () => {
  console.log(JSON.stringify(selectCharacters.value))
}, { deep: true })

const viewNinpou = ref('なし')

const selectSkill = ref('')
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang='scss' scoped>
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
  :deep(.v-field__append-inner),
  :deep(.v-text-field__prefix),
  :deep(.v-field__input) {
    padding-top: 0;
    min-height: auto;
  }
}
</style>
