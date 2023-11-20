<template>
  <pane-frame title="特技比較ツール">
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

      <v-defaults-provider :defaults="{ VSelect: { variant: 'plain', hideDetails: true, class: 'menu-select' } }">
        <v-select prefix="比較数: " :items="[2, 3, 4, 5, 6]" style="max-width: 6.5em" v-model="nums">
          <template #prepend-inner>
            <v-icon icon="mdi-triangle-small-down" />
          </template>
        </v-select>
        <v-select prefix="忍法・奥義表示: " :items="['なし', 'あり']" style="max-width: 10em" v-model="viewNinpou">
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
            <v-select :prefix="`ハンドアウト: `" v-model="selectCharacters[i]" />
            <speciality-table
              :info="list.find(cw => cw.handoutId === selectCharacters[i])?.character.character.skill || undefined"
              :perspective="perspective"
              v-model:select-skill="selectSkill"
              @update:info="v => updateInfo(selectCharacters[i] || '', v)"
              :editing="false"
              :editable="false"
            />
            <ninpou-table
              v-if="viewNinpou === 'あり'"
              class="mt-1"
              :perspective="perspective"
              :select-skill="selectSkill"
              :list="list.find(cw => cw.handoutId === selectCharacters[i])?.character.character.ninjaArtsList"
              @click-skill="onClickSkill"
            />
            <special-arts-table
              v-if="viewNinpou === 'あり'"
              class="mt-1"
              :owner-id="''"
              :select-skill="selectSkill"
              :list="list.find(cw => cw.handoutId === selectCharacters[i])?.character.character.specialArtsList"
              :perspective="perspective"
              @click-skill="onClickSkill"
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
import SpecialArtsTable from '@/components/panes/Shinobigami/SpecialArtsTable.vue'
import { ShinobigamiHandout } from '@/components/panes/Shinobigami/shinobigami'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

const isUserControl = computed(() => Boolean(graphQlStore?.state.user?.token))
const perspective = ref(graphQlStore?.state.user?.token ? '' : graphQlStore?.state.player?.id || '')

const perspectiveList = computed(() => [
  { value: '', name: '主催者' },
  ...(graphQlStore?.state.players.map(p => ({ value: p.id, name: p.name })) || [])
])

// eslint-disable-next-line unused-imports/no-unused-vars
const emits = defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
}>()

type Info = {
  handoutId: string
  handout: ShinobigamiHandout
  characterId: string
  character: CharacterWrap
  name: string
}

const list = computed((): Info[] => {
  if (!graphQlStore) return [] as Info[]
  return graphQlStore.state.sessionDataList
    .map(sd => {
      if (sd.type !== 'shinobigami-handout') return null
      const character = graphQlStore.state.sessionDataList.find(sdc => sdc.id === sd.data.person)
      if (character && (graphQlStore.state.user?.token || sd.data.published)) {
        const characterName = character?.data.character.characterName
        const player = graphQlStore.state.players.find(p => p.id === character.data.player)
        const playerName = player ? `(${player.name})` : ''
        const name = `${sd.data.name}:${characterName}${playerName}`

        return {
          handoutId: sd.id,
          handout: sd.data,
          characterId: character.id,
          character: character.data,
          name
        }
      }
      return null
    })
    .filter((info): info is Info => Boolean(info))
})

const vSelectDefaults = {
  density: 'compact',
  variant: 'plain',
  hideDetails: true,
  itemValue: 'handoutId',
  itemTitle: 'name',
  singleLine: true,
  active: true,
  class: 'character-select',
  placeholder: '未選択',
  items: list.value
}

const selectCharacters = ref<(string | null)[]>([null, null])
const nums = ref(2)
watch(nums, v => {
  for (let i = v; i > selectCharacters.value.length; ) selectCharacters.value.push(null)
  for (let i = v; i < selectCharacters.value.length; ) selectCharacters.value.splice(i, 1)
})

const viewNinpou = ref('なし')

const selectSkill = ref('')

async function updateInfo(id: string, tokugi: SaikoroFictionTokugi) {
  if (!graphQlStore) return
  const info = list.value.find(cw => cw.handoutId === id)
  if (!info) return
  const characterSheet = clone(info.character)
  if (!characterSheet) return
  characterSheet.character.skill = tokugi
  await graphQlStore.updateShinobigamiCharacter(
    info.characterId,
    characterSheet.player,
    characterSheet.viewPass,
    characterSheet.character
  )
}

function onClickSkill(skill: string) {
  selectSkill.value = skill === selectSkill.value ? '' : skill
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
