<template>
  <v-menu :close-on-content-click="false" scroll-strategy="close">
    <template #activator="{ props }">
      <v-btn variant="text" class="text-body-1 px-0" v-bind="props">
        <div class="d-flex flex-row align-end underline">
          <span class="text-caption">最大行動値：</span>
          <template v-if="maneuverLostActionValue + myselfRoiceActionValue + otherRoiveActionValue">
            <span class="text-h5">{{ maneuverActionValue +  maneuverLostActionValue + myselfRoiceActionValue + otherRoiveActionValue }}</span>
            <span class="text-body-1">=</span>
            <span class="text-body-1 text-info">{{ maneuverActionValue }}</span>
            <span class="text-body-1 text-error">{{ maneuverLostActionValue + myselfRoiceActionValue + otherRoiveActionValue }}</span>
          </template>
          <template v-else>
            <span class="text-h5">{{ maneuverActionValue }}</span>
          </template>
        </div>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>最大行動値</v-card-title>
      <v-card-subtitle style="opacity: 1">
        <span style="opacity: 0.6">基礎値: </span>
        <span class="text-body-1 text-info font-weight-bold">{{ maneuverActionValue }}</span>
        <span class="text-body-1 text-error font-weight-bold" v-if="maneuverLostActionValue">{{ maneuverLostActionValue }}</span>
      </v-card-subtitle>
      <v-card-text class="py-1 d-flex flex-row align-end flex-wrap">
        <span class="pb-1 d-flex flex-column align-center" style="line-height: 20px; font-size: 13px">
          <span style="opacity: 0.6">基本値</span>
          <span class="text-body-1 text-info font-weight-bold">６</span>
        </span>
        <template v-for="(maneuver, idx) in character?.data.character.maneuverList || []" :key="idx">
          <v-sheet v-if="maneuver.type === 3" class="d-flex flex-column align-center pa-1">
            <maneuver-btn-menu
              :character="character!.data.character"
              :disable-button="true"
              :maneuver="maneuver"
              @update:lost="v => onUpdateManeuverLost(characterId, idx, v)"
              @update:used="v => onUpdateManeuverUsed(characterId, idx, v)"
            />
            <span class="text-body-1 font-weight-bold" :class="maneuver.lost ? 'text-grey' : 'text-info'">{{
              `+${convertNumberZero(maneuver.memo)}`
            }}</span>
          </v-sheet>
        </template>
      </v-card-text>
      <v-card-subtitle style="opacity: 1">
        <span style="opacity: 0.6">本人の未練: </span>
        <span class="text-body-1" :class="myselfRoiceActionValue ? 'font-weight-bold text-error' : ''">{{ myselfRoiceActionValue }}</span>
      </v-card-subtitle>
      <v-card-text class="pt-1 pb-3 d-flex flex-row align-end flex-wrap" style="gap: 0.5rem">
        <template v-for="(roice, idx) in actionValueRoices" :key="idx">
          <roice-badge :roice="roice" @update="updateRoice => onUpdateRoice(characterId, idx, updateRoice)" />
        </template>
      </v-card-text>
      <template v-for="(info, infoIdx) in otherRoices" :key="infoIdx">
        <v-card-subtitle style="opacity: 1">
          <span style="opacity: 0.6">{{ info.character.data.character.basic.characterName }}の未練: </span>
          <span class="text-body-1 font-weight-bold text-error">{{ info.actionValue }}</span>
        </v-card-subtitle>
        <v-card-text class="pt-1 pb-3 d-flex flex-row align-end flex-wrap">
          <template v-for="(roice, idx) in info.roiceList" :key="idx">
            <roice-badge :roice="roice.roice" @update="updateRoice => onUpdateRoice(info.character.id, idx, updateRoice)" />
          </template>
        </v-card-text>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { Nechronica, NechronicaManeuver, NechronicaRoice } from '@/components/panes/Nechronica/nechronica'
import { computed, inject } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ManeuverBtnMenu from '@/components/panes/Nechronica/ManeuverBtnMenu.vue'
import RoiceBadge from '@/components/panes/Nechronica/RoiceBadge.vue'
import { convertNumberZero } from '@/components/panes/PrimaryDataUtility'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  characterId: string
}>()

const emits = defineEmits<{
  (e: 'update:maneuver-used', characterId: string, idx: number, value: boolean): Promise<void>
  (e: 'update:maneuver-lost', characterId: string, idx: number, value: boolean): Promise<void>
  (e: 'update:roice', characterId: string, idx: number, roice: NechronicaRoice): Promise<void>
}>()

const character = computed((): { id: string; data: { player: string; character: Nechronica } } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
})

const actionValueManeuvers = computed((): NechronicaManeuver[] => {
  return character.value?.data.character.maneuverList.filter(m => m.type === 3) || []
})
const maneuverActionValue = computed((): number => {
  return actionValueManeuvers.value.reduce((p, c) => p + convertNumberZero(c.memo), 6) || 0
})
const maneuverLostActionValue = computed((): number => {
  return -actionValueManeuvers.value.reduce((p, c) => (c.lost ? p + convertNumberZero(c.memo) : p), 0) || 0
})

const actionValueRoices = computed((): NechronicaRoice[] => {
  return character.value?.data.character.roiceList.filter(r => r.id % 10 === 3) || []
})
const myselfRoiceActionValue = computed((): number => {
  return -actionValueRoices.value.filter(r => r.damage === 4).length * 2
})

type OtherRoiceInfo = {
  character: { id: string; data: { player: string; character: Nechronica } }
  roiceList: {
    index: number
    roice: NechronicaRoice
  }[]
  actionValue: number
}

const otherRoices = computed((): OtherRoiceInfo[] => {
  return (
    graphQlStore?.state.sessionDataList
      .filter(sd => sd.type === 'nechronica-character' && sd.id !== props.characterId)
      .map((c: { id: string; data: { player: string; character: Nechronica } }): OtherRoiceInfo => {
        const roiceList = c.data.character.roiceList
          .map((roice, index): { index: number; roice: NechronicaRoice } => ({
            index,
            roice
          }))
          .filter(info => [10, 30].includes(info.roice.id))
        return {
          character: c,
          roiceList,
          actionValue: -roiceList.filter(r => r.roice.damage === 4).length
        }
      })
      .filter(info => info.roiceList.length) || []
  )
})
const otherRoiveActionValue = computed((): number => {
  return otherRoices.value.reduce((p, c) => p + c.actionValue, 0)
})

function onUpdateManeuverUsed(characterId: string, idx: number, used: boolean) {
  emits('update:maneuver-used', characterId, idx, used)
}

function onUpdateManeuverLost(characterId: string, idx: number, lost: boolean) {
  emits('update:maneuver-lost', characterId, idx, lost)
}

function onUpdateRoice(characterId: string, idx: number, roice: NechronicaRoice) {
  emits('update:roice', characterId, idx, roice)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.underline {
  position: relative;

  &:before {
    content: '';
    position: absolute;
    bottom: 2px;
    left: -4px;
    right: -4px;
    margin: auto;
    border-bottom: 1px solid black;
  }
}
</style>
