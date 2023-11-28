<template>
  <v-sheet class="d-flex flex-row flex-wrap overflow-y-auto" style="gap: 0.5rem">
    <template v-if="character">
      <v-card
        variant="outlined"
        class="d-flex flex-column pa-2 rounded-xl"
        style="box-sizing: border-box; border-width: 3px"
        :style="`border-color: ${
          NechronicaTypeColorMap.find(nc => nc.type === character?.data.type)?.color || 'black'
        }`"
      >
        <v-card-title class="d-flex flex-row text-no-wrap flex-wrap pa-0 align-center">
          <action-value-menu
            v-if="character.data.type !== 'legion'"
            :character-id="characterId"
            @update:action-value="onUpdateActionValue"
            @update:maneuver-used="onUpdateManeuverUsed"
            @update:maneuver-lost="onUpdateManeuverLost"
            @update:maneuver-ignore-heiki="onUpdateManeuverIgnoreHeiki"
            @update:roice="onUpdateRoice"
          />
          <action-value-menu-legion
            v-else
            :character-id="characterId"
            @update:max-action-value="onUpdateMaxActionValue"
          />
          <v-spacer />
          <character-sheet-view-config
            :character-id="characterId"
            :name="character?.data.character.basic.characterName || ''"
            @update:columns="v => (columns = v)"
          />
        </v-card-title>
        <v-card-text class="d-flex flex-column align-stretch justify-center px-0 pt-1 pb-0">
          <character-name-menu :character-id="characterId" @update:position="onUpdatePosition" />
        </v-card-text>
        <character-sheet-view-roice-area
          v-if="character.data.type === 'doll' && viewOption.roicePosition === 'before'"
          :character-id="characterId"
          :mode="viewOption.mode"
          :roice-list="character?.data.character.roiceList || []"
          @update:roice="onUpdateRoice"
          @add="onAddRoice"
          @delete="onDeleteRoice"
        />
        <v-card-text
          v-if="['doll', 'servent'].includes(character.data.type)"
          class="d-flex flex-row flex-wrap px-0 pb-0 pt-2"
        >
          <maneuver-list-view
            :character="character.data.character"
            :view-option="viewOption"
            :columns="columns || 10"
            :mode="viewOption.mode"
            :type="character.data.type"
            @update:used="(idx, used) => onUpdateManeuverUsed(characterId, idx, used)"
            @update:lost="(idx, lost) => onUpdateManeuverLost(characterId, idx, lost)"
            @update="(idx, maneuver) => onUpdateManeuver(characterId, idx, maneuver)"
          />
        </v-card-text>
        <v-card-text
          v-else
          class="d-flex flex-row flex-wrap px-0 pb-0 pt-2"
          :style="`max-width: ${columns * 60 - 8}px`"
          style="gap: 0.5rem"
        >
          <template v-for="(maneuver, idx) in character.data.character.maneuverList" :key="idx">
            <maneuver-btn-menu
              v-if="judgeView(maneuver)"
              :character="character.data.character"
              :maneuver="maneuver"
              :mode="viewOption.mode"
              :type="character.data.type"
              :view-label="viewOption?.viewLabel || ''"
              @update:lost="lost => onUpdateManeuverLost(characterId, idx, lost)"
              @update:used="used => onUpdateManeuverUsed(characterId, idx, used)"
              @update="maneuver => onUpdateManeuver(characterId, idx, maneuver)"
            />
          </template>
        </v-card-text>
        <v-card-text class="d-flex flex-row justify-end px-1 py-0">
          <reset-used-maneuver-btn
            :disabled="character.data.character.maneuverList.every(m => !m.used)"
            @execute="onResetUsedMenu"
          />
        </v-card-text>
        <character-sheet-view-roice-area
          v-if="character.data.type === 'doll' && viewOption.roicePosition === 'after'"
          :character-id="characterId"
          :mode="viewOption.mode"
          :roice-list="character?.data.character.roiceList || []"
          @update:roice="onUpdateRoice"
          @add="onAddRoice"
          @delete="onDeleteRoice"
        />
      </v-card>
    </template>
  </v-sheet>
</template>

<script setup lang="ts">
import ManeuverListView from '@/components/panes/Nechronica/ManeuverListView.vue'
import {
  NechronicaManeuver,
  NechronicaRoice,
  NechronicaTypeColorMap,
  NechronicaWrap,
  roiceList
} from '@/components/panes/Nechronica/nechronica'
import { computed, inject, ref } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ActionValueMenu from '@/components/panes/Nechronica/ActionValueMenu.vue'
import ActionValueMenuLegion from '@/components/panes/Nechronica/ActionValueMenuLegion.vue'
import CharacterNameMenu from '@/components/panes/Nechronica/CharacterNameMenu.vue'
import CharacterSheetViewConfig from '@/components/panes/Nechronica/CharacterSheetViewConfig.vue'
import CharacterSheetViewRoiceArea from '@/components/panes/Nechronica/CharacterSheetViewRoiceArea.vue'
import ManeuverBtnMenu from '@/components/panes/Nechronica/ManeuverBtnMenu.vue'
import ResetUsedManeuverBtn from '@/components/panes/Nechronica/ResetUsedManeuverBtn.vue'
import { NechronicaViewOption } from '@/components/panes/Nechronica/ViewOptionNav.vue'
import { clone } from '@/components/panes/PrimaryDataUtility'

const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  characterId: string
  viewOption: NechronicaViewOption
}>()

const character = computed((): { id: string; data: NechronicaWrap } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
})

const columns = ref(10)

const resetUsedMenu = ref(false)

function judgeView(maneuver: NechronicaManeuver) {
  if (!props.viewOption) return true
  if (maneuver.lost && !props.viewOption.viewLost) return false
  if (maneuver.used && !props.viewOption.viewUsed) return false
  if (props.viewOption.selectedTimings.every(t => t !== maneuver.timing)) return false
  return props.viewOption.selectedTypes.some(t => t === maneuver.type)
}

function updateNechronicaCharacterHelper(characterId: string, wrapFunc: (character: NechronicaWrap) => boolean) {
  const c = graphQlStore?.state.sessionDataList.find(sd => sd.id === characterId)
  if (!c) return
  const updateCharacter = clone<NechronicaWrap>(c.data)!
  if (!wrapFunc(updateCharacter)) return
  graphQlStore?.updateNechronicaCharacter(characterId, updateCharacter)
}

function onResetUsedMenu() {
  resetUsedMenu.value = false

  updateNechronicaCharacterHelper(props.characterId, c => {
    if (c.character.maneuverList.every(m => !m.used)) return false
    c.character.maneuverList.forEach(m => {
      m.used = false
    })
    return true
  })
}

function onUpdateManeuverUsed(characterId: string, idx: number, used: boolean) {
  updateNechronicaCharacterHelper(characterId, c => {
    if (c.character.maneuverList[idx].used === used) return false
    c.character.maneuverList[idx].used = used
    return true
  })
}

function onUpdateManeuverLost(characterId: string, idx: number, lost: boolean) {
  updateNechronicaCharacterHelper(characterId, c => {
    if (c.character.maneuverList[idx].lost === lost) return false
    c.character.maneuverList[idx].lost = lost
    c.character.maneuverList[idx].ignoreHeiki = undefined
    return true
  })
}

function onUpdateManeuverIgnoreHeiki(characterId: string, idx: number) {
  updateNechronicaCharacterHelper(characterId, c => {
    c.character.maneuverList[idx].ignoreHeiki = !c.character.maneuverList[idx].ignoreHeiki || undefined
    return true
  })
}

function onUpdateManeuver(characterId: string, idx: number, maneuver: NechronicaManeuver) {
  updateNechronicaCharacterHelper(characterId, c => {
    if (JSON.stringify(c.character.maneuverList[idx]) === JSON.stringify(maneuver)) return false
    c.character.maneuverList[idx] = maneuver
    return true
  })
}

function onUpdateRoice(characterId: string, idx: number, roice: NechronicaRoice) {
  updateNechronicaCharacterHelper(characterId, c => {
    const r = c.character.roiceList[idx]
    if (JSON.stringify(r) === JSON.stringify(roice)) return false
    c.character.roiceList[idx] = roice
    return true
  })
}

function onUpdateActionValue(actionValue: number) {
  updateNechronicaCharacterHelper(props.characterId, c => {
    if (c.actionValue === actionValue) return false
    c.actionValue = actionValue
    return true
  })
}

function onUpdateMaxActionValue(maxActionValue: number) {
  updateNechronicaCharacterHelper(props.characterId, c => {
    if (c.maxActionValue === maxActionValue) return false
    c.maxActionValue = maxActionValue
    return true
  })
}

function onUpdatePosition(position: number) {
  updateNechronicaCharacterHelper(props.characterId, c => {
    if (c.position === position) return false
    c.position = position
    return true
  })
}

function onAddRoice() {
  updateNechronicaCharacterHelper(props.characterId, c => {
    const rawRoice = roiceList[1]
    c.character.roiceList.push({
      id: 1,
      name: `未練${c.character.roiceList.length + 1}`,
      pos: rawRoice.pos,
      damage: 3,
      neg: rawRoice.neg,
      breakEffect: rawRoice.breakEffect,
      memo: ''
    })
    return true
  })
}

function onDeleteRoice(characterId: string, idx: number) {
  updateNechronicaCharacterHelper(characterId, c => {
    c.character.roiceList.splice(idx, 1)
    return true
  })
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
