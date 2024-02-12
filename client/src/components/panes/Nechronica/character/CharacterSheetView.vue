<template>
  <v-sheet class="d-flex flex-row flex-wrap overflow-y-auto" style="gap: 0.5rem">
    <template v-if="character">
      <v-card
        variant="outlined"
        class="d-flex flex-column px-2 pb-2 rounded-xl"
        :class="isCurrent ? '' : 'bg-grey-lighten-2'"
        style="box-sizing: border-box; border-width: 3px"
        :style="`border-color: ${
          mapping.CHARACTER_TYPE.find(nc => nc.type === character?.data.type)?.color || 'black'
        }`"
      >
        <v-card-title class="d-flex flex-row text-no-wrap flex-wrap pa-0 align-center">
          <action-value-menu
            v-if="character.data.type !== 'legion'"
            :character-id="characterId"
            @update:action-value="onUpdateActionValue"
            @update:maneuver-used="onUpdateManeuverUsed"
            @update:maneuver-lost="onUpdateManeuverLost"
            @update:maneuver-ignore-bravado="onUpdateManeuverIgnoreBravado"
            @update:roice="onUpdateRoice"
          />
          <action-value-menu-legion
            v-else
            :character-id="characterId"
            @update:action-value="onUpdateActionValue"
            @update:max-action-value="onUpdateMaxActionValue"
            @update:health="onUpdateHealth"
          />
          <v-spacer />
          <character-sheet-view-config
            :character-id="characterId"
            :name="character?.data.character.basic.characterName || ''"
            @update:columns="v => (columns = v)"
          />
        </v-card-title>
        <v-card-text class="d-flex flex-column align-stretch justify-center px-0 pt-1 pb-0">
          <character-name-menu
            :character-id="characterId"
            :perspective="perspective"
            @update:position="onUpdatePosition"
          />
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
          v-if="['doll', 'savant'].includes(character.data.type)"
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
            @update:ignore-bravado="
              (idx, ignoreBravado) => onUpdateManeuverIgnoreBravado(characterId, idx, ignoreBravado)
            "
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
              @update:ignore-bravado="ignoreBravado => onUpdateManeuverIgnoreBravado(characterId, idx, ignoreBravado)"
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
  NechronicaManeuverStack,
  NechronicaManeuverStackBase,
  NechronicaRoice,
  NechronicaSingleton,
  NechronicaWrap
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
import mapping from '@/components/panes/Nechronica/mapping.json'
import { clone } from '@/components/panes/PrimaryDataUtility'
import { useI18n } from 'vue-i18n'

const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  characterId: string
  viewOption: NechronicaViewOption
  battleTiming: string
  battleCount: number
  perspective: string
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
  if (props.viewOption.selectedTimings.every((timing: number) => timing !== maneuver.timing)) return false
  return props.viewOption.selectedTypes.some((timing: number) => timing === maneuver.type)
}

const singleton = computed((): { id: string; data: NechronicaSingleton } | undefined =>
  graphQlStore?.state.sessionDataList.find(sd => sd.type === 'nechronica-singleton')
)

async function addManeuverStack(
  characterId: string,
  callback: (base: NechronicaManeuverStackBase) => NechronicaManeuverStack
) {
  await graphQlStore?.updateNechronicaSingletonHelper<NechronicaSingleton>(d => {
    const maneuverStack = singleton.value?.data.maneuverStack || []
    const cloned = clone(maneuverStack)!
    const idx = cloned.findIndex(c => !c.status)
    const character: { id: string; data: NechronicaWrap } | undefined = graphQlStore?.state.sessionDataList.find(
      sd => sd.id === characterId
    )
    const base: NechronicaManeuverStackBase = {
      characterId,
      place: character?.data.position || 0,
      status: '',
      start: 0,
      end: 0
    }
    cloned.splice(idx, 0, callback(base))
    const result: NechronicaSingleton = {
      ...d,
      maneuverStack: cloned
    }
    return result
  })
}

async function addManeuverStackUse(characterId: string, maneuverIndex: number, cost: number) {
  await addManeuverStack(characterId, base => {
    return {
      ...base,
      type: 'use',
      maneuverIndex,
      cost
    }
  })
}

async function addManeuverStackLost(characterId: string, maneuverIndex: number) {
  await addManeuverStack(characterId, base => {
    return {
      ...base,
      type: 'lost',
      maneuverIndex
    }
  })
}

async function addManeuverStackMove(characterId: string, beforePlace: number, afterPlace: number) {
  await addManeuverStack(characterId, base => {
    return {
      ...base,
      type: 'move',
      beforePlace,
      place: afterPlace
    }
  })
}

async function onUpdateManeuverUsed(characterId: string, idx: number, used: boolean, cost: number) {
  await graphQlStore?.updateNechronicaCharacterHelper(characterId, c => {
    const maneuver = c.character.maneuverList.at(idx)
    if (!maneuver) return
    maneuver.used = used
    if (used) c.actionValue -= cost
  })
  if (used) await addManeuverStackUse(characterId, idx, cost)
}

async function onUpdateManeuverLost(characterId: string, idx: number, lost: boolean) {
  await graphQlStore?.updateNechronicaCharacterHelper(characterId, c => {
    const maneuver = c.character.maneuverList.at(idx)
    if (!maneuver) return
    maneuver.lost = lost
    maneuver.ignoreBravado = undefined
  })
  if (lost) {
    await addManeuverStackLost(characterId, idx)
  }
}

async function onUpdateManeuverIgnoreBravado(characterId: string, idx: number, value: boolean) {
  await graphQlStore?.updateNechronicaCharacterHelper(characterId, c => {
    const maneuver = c.character.maneuverList.at(idx)
    if (!maneuver) return
    maneuver.ignoreBravado = value || undefined
  })
}

async function onUpdateManeuver(characterId: string, idx: number, maneuver: NechronicaManeuver) {
  await graphQlStore?.updateNechronicaCharacterHelper(characterId, c => {
    if (!c.character.maneuverList.at(idx)) return
    c.character.maneuverList[idx] = maneuver
  })
}

async function onUpdateRoice(characterId: string, idx: number, roice: NechronicaRoice) {
  await graphQlStore?.updateNechronicaCharacterHelper(characterId, c => {
    if (!c.character.roiceList.at(idx)) return
    c.character.roiceList[idx] = roice
  })
}

async function onUpdateHealth(health: number) {
  await graphQlStore?.updateNechronicaCharacterHelper(props.characterId, c => {
    c.health = health
  })
}

async function onUpdateActionValue(actionValue: number) {
  await graphQlStore?.updateNechronicaCharacterHelper(props.characterId, c => {
    c.actionValue = actionValue
  })
}

async function onUpdateMaxActionValue(maxActionValue: number) {
  await graphQlStore?.updateNechronicaCharacterHelper(props.characterId, c => {
    c.maxActionValue = maxActionValue
  })
}

async function onUpdatePosition(position: number) {
  let beforePlace = 0
  await graphQlStore?.updateNechronicaCharacterHelper(props.characterId, c => {
    beforePlace = c.position
    c.position = position
  })
  console.log(beforePlace, position)
  await addManeuverStackMove(props.characterId, beforePlace, position)
}

const { t } = useI18n()

async function onAddRoice() {
  await graphQlStore?.updateNechronicaCharacterHelper(props.characterId, c => {
    c.character.roiceList.push({
      id: 1,
      name: `${t('Nechronica.label.roice')}${c.character.roiceList.length + 1}`,
      damage: 3,
      memo: ''
    })
  })
}

async function onDeleteRoice(characterId: string, idx: number) {
  await graphQlStore?.updateNechronicaCharacterHelper(characterId, c => {
    c.character.roiceList.splice(idx, 1)
  })
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
