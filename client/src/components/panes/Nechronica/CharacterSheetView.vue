<template>
  <v-sheet class="d-flex flex-row flex-wrap overflow-y-auto" style="gap: 0.5rem">
    <template v-if="character">
      <v-card variant="outlined" class="d-flex flex-column pa-2 rounded-xl" style="box-sizing: border-box">
        <v-card-title class="d-flex flex-row text-no-wrap flex-wrap pa-0 align-center justify-space-between">
          <action-value-menu
            :character-id="characterId"
            @update:maneuver-used="onUpdateManeuverUsed"
            @update:maneuver-lost="onUpdateManeuverLost"
            @update:roice="onUpdateRoice"
          />
          <character-sheet-view-config
            :character-id="characterId"
            :name="character?.data.character.basic.characterName || ''"
            @update:columns="v => (columns = v)"
          />
        </v-card-title>
        <v-card-text class="d-flex flex-column align-stretch justify-center px-0 py-1">
          <character-name-menu :character-id="characterId" />
          <v-sheet class="d-flex flex-row pb-2">
            <v-sheet class="d-flex flex-row flex-wrap" style="width: 1em; flex-grow: 1; gap: 0.5rem">
              <template v-for="(roice, idx) in character?.data.character.roiceList || []" :key="idx">
                <roice-badge :roice="roice" @update="updateRoice => onUpdateRoice(characterId, idx, updateRoice)" />
              </template>
            </v-sheet>
          </v-sheet>
        </v-card-text>
        <v-card-text class="d-flex flex-column pa-0">
          <maneuver-list-view
            :character="character.data.character"
            :view-option="viewOption"
            :columns="columns || 10"
            @update:used="(idx, used) => onUpdateManeuverUsed(characterId, idx, used)"
            @update:lost="(idx, lost) => onUpdateManeuverLost(characterId, idx, lost)"
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
import { Nechronica, NechronicaRoice } from '@/components/panes/Nechronica/nechronica'
import { computed, inject, ref } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ActionValueMenu from '@/components/panes/Nechronica/ActionValueMenu.vue'
import CharacterNameMenu from '@/components/panes/Nechronica/CharacterNameMenu.vue'
import CharacterSheetViewConfig from '@/components/panes/Nechronica/CharacterSheetViewConfig.vue'
import ResetUsedManeuverBtn from '@/components/panes/Nechronica/ResetUsedManeuverBtn.vue'
import RoiceBadge from '@/components/panes/Nechronica/RoiceBadge.vue'
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

const columns = ref(10)

const resetUsedMenu = ref(false)

function updateNechronicaCharacterHelper(characterId: string, wrapFunc: (character: Nechronica) => boolean) {
  const c = graphQlStore?.state.sessionDataList.find(sd => sd.id === characterId)
  if (!c) return
  const updateCharacter = clone<Nechronica>(c.data.character)!
  if (!wrapFunc(updateCharacter)) return
  graphQlStore?.updateNechronicaCharacter(characterId, c.data.player, updateCharacter)
}

function onResetUsedMenu() {
  resetUsedMenu.value = false

  updateNechronicaCharacterHelper(props.characterId, c => {
    if (c.maneuverList.every(m => !m.used)) return false
    c.maneuverList.forEach(m => {
      m.used = false
    })
    return true
  })
}

function onUpdateManeuverUsed(characterId: string, idx: number, used: boolean) {
  updateNechronicaCharacterHelper(characterId, c => {
    if (c.maneuverList[idx].used === used) return false
    c.maneuverList[idx].used = used
    return true
  })
}

function onUpdateManeuverLost(characterId: string, idx: number, lost: boolean) {
  updateNechronicaCharacterHelper(characterId, c => {
    if (c.maneuverList[idx].lost === lost) return false
    c.maneuverList[idx].lost = lost
    return true
  })
}

function onUpdateRoice(characterId: string, idx: number, roice: NechronicaRoice) {
  updateNechronicaCharacterHelper(characterId, c => {
    const r = c.roiceList[idx]
    if (JSON.stringify(r) === JSON.stringify(roice)) return false
    c.roiceList[idx] = roice
    return true
  })
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
