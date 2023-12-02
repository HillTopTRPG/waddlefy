<template>
  <v-sheet class="d-flex flex-row flex-wrap overflow-y-auto" style="gap: 0.5rem">
    <template v-if="character">
      <v-card
        variant="outlined"
        class="d-flex flex-column pa-2 rounded-xl"
        :class="isCurrent ? '' : 'bg-grey-lighten-2'"
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
            @update:action-value="onUpdateActionValue"
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
            :battle-timing="battleTiming"
            :columns="columns || 10"
            :type="character.data.type"
            @update:used="(idx, used, cost) => onUpdateManeuverUsed(characterId, idx, used, cost)"
            @update:lost="(idx, lost) => onUpdateManeuverLost(characterId, idx, lost)"
            @update:ignore-heiki="(idx, ignoreHeiki) => onUpdateManeuverIgnoreHeiki(characterId, idx, ignoreHeiki)"
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
              :type="character.data.type"
              :view-label="viewOption?.viewLabel || ''"
              :battle-timing="battleTiming"
              @update:lost="lost => onUpdateManeuverLost(characterId, idx, lost)"
              @update:used="(used, cost) => onUpdateManeuverUsed(characterId, idx, used, cost)"
              @update:ignore-heiki="ignoreHeiki => onUpdateManeuverIgnoreHeiki(characterId, idx, ignoreHeiki)"
              @update="updateManeuver => onUpdateManeuver(characterId, idx, updateManeuver)"
            />
          </template>
        </v-card-text>
        <character-sheet-view-roice-area
          v-if="character.data.type === 'doll' && viewOption.roicePosition === 'after'"
          :character-id="characterId"
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
import ManeuverListView from '@/components/panes/Nechronica/maneuver/ManeuverListView.vue'
import {
  NechronicaManeuver,
  NechronicaRoice,
  NechronicaSingleton,
  NechronicaTypeColorMap,
  NechronicaWrap,
  roiceList
} from '@/components/panes/Nechronica/nechronica'
import { computed, inject, ref } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ActionValueMenu from '@/components/panes/Nechronica/action-value/ActionValueMenu.vue'
import ActionValueMenuLegion from '@/components/panes/Nechronica/action-value/ActionValueMenuLegion.vue'
import CharacterNameMenu from '@/components/panes/Nechronica/character/CharacterNameMenu.vue'
import CharacterSheetViewConfig from '@/components/panes/Nechronica/character/CharacterSheetViewConfig.vue'
import CharacterSheetViewRoiceArea from '@/components/panes/Nechronica/character/CharacterSheetViewRoiceArea.vue'
import { NechronicaViewOption } from '@/components/panes/Nechronica/component/ViewOptionNav.vue'
import ManeuverBtnMenu from '@/components/panes/Nechronica/maneuver/ManeuverBtnMenu.vue'
import { clone } from '@/components/panes/PrimaryDataUtility'

const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  characterId: string
  viewOption: NechronicaViewOption
  battleTiming: string
  battleCount: number
}>()

const character = computed((): { id: string; data: NechronicaWrap } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
})

const isCurrent = computed(() => {
  return (character.value?.data.actionValue || 0) >= props.battleCount
})

const columns = ref(10)

function judgeView(maneuver: NechronicaManeuver) {
  if (!props.viewOption) return true
  if (maneuver.lost && !props.viewOption.viewLost) return false
  if (maneuver.used && !props.viewOption.viewUsed) return false
  if (props.viewOption.selectedTimings.every(t => t !== maneuver.timing)) return false
  return props.viewOption.selectedTypes.some(t => t === maneuver.type)
}

async function updateNechronicaCharacterHelper(characterId: string, wrapFunc: (character: NechronicaWrap) => boolean) {
  const c = graphQlStore?.state.sessionDataList.find(sd => sd.id === characterId)
  if (!c) return
  const updateCharacter = clone<NechronicaWrap>(c.data)!
  if (!wrapFunc(updateCharacter)) return
  await graphQlStore?.updateNechronicaCharacter(characterId, updateCharacter)
}

const singleton = computed(
  (): { id: string; data: NechronicaSingleton } | undefined =>
    graphQlStore?.state.sessionDataList.find(sd => sd.type === 'singleton')
)

async function addManeuverStack(characterId: string, maneuverIndex: number, type: 'use' | 'lost', cost: number) {
  await graphQlStore?.updateSingletonHelper<NechronicaSingleton>(d => {
    const maneuverStack = singleton.value?.data.maneuverStack || []
    const cloned = clone(maneuverStack)!
    const idx = cloned.findIndex(c => !c.status)
    console.log(idx)
    cloned.splice(idx, 0, { characterId, maneuverIndex, type, cost, status: '', start: 0, end: 0 })
    const result: NechronicaSingleton = {
      ...d,
      maneuverStack: cloned
    }
    return result
  })
}

async function onUpdateManeuverUsed(characterId: string, idx: number, used: boolean, cost: number) {
  await updateNechronicaCharacterHelper(characterId, c => {
    if (c.character.maneuverList[idx].used === used) return false
    const maneuver = c.character.maneuverList[idx]
    maneuver.used = used
    if (used) {
      console.log({ cost })
      c.actionValue -= cost
    }
    return true
  })
  if (used) {
    await addManeuverStack(characterId, idx, 'use', cost)
  }
}

async function onUpdateManeuverLost(characterId: string, idx: number, lost: boolean) {
  await updateNechronicaCharacterHelper(characterId, c => {
    if (c.character.maneuverList[idx].lost === lost) return false
    c.character.maneuverList[idx].lost = lost
    c.character.maneuverList[idx].ignoreHeiki = undefined
    return true
  })
  if (lost) {
    await addManeuverStack(characterId, idx, 'lost', 0)
  }
}

async function onUpdateManeuverIgnoreHeiki(characterId: string, idx: number, value: boolean) {
  await updateNechronicaCharacterHelper(characterId, c => {
    c.character.maneuverList[idx].ignoreHeiki = value || undefined
    return true
  })
}

async function onUpdateManeuver(characterId: string, idx: number, maneuver: NechronicaManeuver) {
  await updateNechronicaCharacterHelper(characterId, c => {
    if (JSON.stringify(c.character.maneuverList[idx]) === JSON.stringify(maneuver)) return false
    c.character.maneuverList[idx] = maneuver
    return true
  })
}

async function onUpdateRoice(characterId: string, idx: number, roice: NechronicaRoice) {
  await updateNechronicaCharacterHelper(characterId, c => {
    const r = c.character.roiceList[idx]
    if (JSON.stringify(r) === JSON.stringify(roice)) return false
    c.character.roiceList[idx] = roice
    return true
  })
}

async function onUpdateActionValue(actionValue: number) {
  await updateNechronicaCharacterHelper(props.characterId, c => {
    if (c.actionValue === actionValue) return false
    c.actionValue = actionValue
    return true
  })
}

async function onUpdateMaxActionValue(maxActionValue: number) {
  await updateNechronicaCharacterHelper(props.characterId, c => {
    if (c.maxActionValue === maxActionValue) return false
    c.maxActionValue = maxActionValue
    return true
  })
}

async function onUpdatePosition(position: number) {
  await updateNechronicaCharacterHelper(props.characterId, c => {
    if (c.position === position) return false
    c.position = position
    return true
  })
}

async function onAddRoice() {
  await updateNechronicaCharacterHelper(props.characterId, c => {
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

async function onDeleteRoice(characterId: string, idx: number) {
  await updateNechronicaCharacterHelper(characterId, c => {
    c.character.roiceList.splice(idx, 1)
    return true
  })
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
