<template>
  <v-sheet class="d-flex flex-row flex-wrap overflow-y-auto" style="gap: 0.5rem">
    <template v-if="character">
      <v-card variant="outlined" class="d-flex flex-column pa-2 rounded-xl" style="box-sizing: border-box">
        <v-card-title class="d-flex flex-row text-no-wrap flex-wrap pa-0 align-center justify-space-between">
          <action-value-menu
            :maneuvers="character.data.character.maneuverList"
            @update:used="onUpdateManeuverUsed"
            @update:lost="onUpdateManeuverLost"
          />
          <character-sheet-view-config
            :character-id="characterId"
            :name="character?.data.character.basic.characterName || ''"
          />
        </v-card-title>
        <v-card-text class="d-flex flex-column align-stretch justify-center px-0 py-1">
          <character-name-menu :character-id="characterId" />
        </v-card-text>
        <v-card-text class="d-flex flex-column pa-0">
          <maneuver-list-view
            :character="character.data.character"
            :view-option="viewOption"
            :columns="useColumns"
            @update:used="onUpdateManeuverUsed"
            @update:lost="onUpdateManeuverLost"
          />
        </v-card-text>
        <v-card-actions class="justify-end pb-0">
          <reset-used-maneuver-btn
            :disabled="character.data.character.maneuverList.every(m => !m.used)"
            @execute="onResetUsedMenu"
          />
        </v-card-actions>
      </v-card>
    </template>
  </v-sheet>
</template>

<script setup lang="ts">
import ManeuverListView from '@/components/panes/Nechronica/ManeuverListView.vue'
import { Nechronica } from '@/components/panes/Nechronica/nechronica'
import { computed, inject, ref } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ActionValueMenu from '@/components/panes/Nechronica/ActionValueMenu.vue'
import CharacterNameMenu from '@/components/panes/Nechronica/CharacterNameMenu.vue'
import CharacterSheetViewConfig from '@/components/panes/Nechronica/CharacterSheetViewConfig.vue'
import ResetUsedManeuverBtn from '@/components/panes/Nechronica/ResetUsedManeuverBtn.vue'
import { NechronicaViewOption } from '@/components/panes/Nechronica/ViewOptionNav.vue'
import { clone } from '@/components/panes/PrimaryDataUtility'

const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  characterId: string
  viewOption: NechronicaViewOption
}>()

const character = computed((): { id: string; data: { player: string; character: Nechronica } } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
})

const owner = computed(() => (graphQlStore?.state.user?.token ? 'user' : graphQlStore?.state.player?.id || ''))
const characterViewConfig = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => {
    if (sd.type !== 'target-config') return false
    if (sd.data.type !== 'character-view') return false
    return sd.data.owner === owner.value && sd.data.target === props.characterId
  })
})

const useColumns = ref(characterViewConfig.value?.data.data.columns || 10)

const resetUsedMenu = ref(false)

function updateNechronicaCharacterHelper(wrapFunc: (character: Nechronica) => boolean) {
  if (!character.value) return
  const updateCharacter = clone<Nechronica>(character.value.data.character)!
  if (!wrapFunc(updateCharacter)) return
  graphQlStore?.updateNechronicaCharacter(props.characterId, character.value.player, updateCharacter)
}

function onResetUsedMenu() {
  resetUsedMenu.value = false

  updateNechronicaCharacterHelper(c => {
    if (c.maneuverList.every(m => !m.used)) return false
    c.maneuverList.forEach(m => {
      m.used = false
    })
    return true
  })
}

function onUpdateManeuverUsed(idx: number, used: boolean) {
  updateNechronicaCharacterHelper(c => {
    if (c.maneuverList[idx].used === used) return false
    c.maneuverList[idx].used = used
    return true
  })
}

function onUpdateManeuverLost(idx: number, lost: boolean) {
  updateNechronicaCharacterHelper(c => {
    if (c.maneuverList[idx].lost === lost) return false
    c.maneuverList[idx].lost = lost
    return true
  })
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
