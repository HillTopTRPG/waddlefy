<template>
  <v-menu :close-on-content-click="false" scroll-strategy="close">
    <template #activator="{ props }">
      <v-btn variant="text" class="text-body-1 px-0" v-bind="props">
        <div class="d-flex flex-row align-end underline">
          <span class="text-caption">最大行動値：</span>
          <span class="text-h5">{{ maneuverActionValue + myselfRoiceActionValue + otherRoiveActionValue }}</span>
        </div>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>最大行動値</v-card-title>
      <v-card-subtitle style="opacity: 1">
        <span style="opacity: 0.6">基礎値: </span>
        <span class="text-body-1 text-info font-weight-bold">{{ maneuverActionValue }}</span>
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
              @update:lost="v => onUpdateManeuverLost(idx, v)"
              @update:used="v => onUpdateManeuverUsed(idx, v)"
            />
            <span class="text-body-1 font-weight-bold" :class="maneuver.lost ? 'text-grey' : 'text-info'">{{
              maneuver.lost ? '0' : `+${convertNumberZero(maneuver.memo)}`
            }}</span>
          </v-sheet>
        </template>
      </v-card-text>
      <v-card-subtitle style="opacity: 1">
        <span style="opacity: 0.6">本人の未練: </span>
        <span class="text-body-1 font-weight-bold text-error">{{ myselfRoiceActionValue }}</span>
      </v-card-subtitle>
      <v-card-text class="pt-1 pb-3 d-flex flex-row align-end flex-wrap" style="gap: 0.5rem">
        <template v-for="(roice, idx) in actionValueRoices" :key="idx">
          <roice-badge :roice="roice" />
        </template>
      </v-card-text>
      <template v-for="(info, infoIdx) in otherRoices" :key="infoIdx">
        <v-card-subtitle style="opacity: 1">
          <span style="opacity: 0.6">{{ info.character.data.character.basic.characterName }}の未練: </span>
          <span class="text-body-1 font-weight-bold text-error">{{ info.actionValue }}</span>
        </v-card-subtitle>
        <v-card-text class="pt-1 pb-3 d-flex flex-row align-end flex-wrap">
          <template v-for="(roice, idx) in info.roiceList" :key="idx">
            <roice-badge :roice="roice.roice" />
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
  (e: 'update:used', idx: number, value: boolean): Promise<void>
  (e: 'update:lost', idx: number, value: boolean): Promise<void>
}>()

const character = computed((): { id: string; data: { player: string; character: Nechronica } } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
})

const actionValueManeuvers = computed((): NechronicaManeuver[] => {
  return character.value?.data.character.maneuverList.filter(m => m.type === 3) || []
})
const maneuverActionValue = computed((): number => {
  return actionValueManeuvers.value.reduce((p, c) => (c.lost ? p : p + convertNumberZero(c.memo)), 6) || 0
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
      }) || []
  )
})
const otherRoiveActionValue = computed((): number => {
  return otherRoices.value.reduce((p, c) => p + c.actionValue, 0)
})

function onUpdateManeuverUsed(idx: number, used: boolean) {
  emits('update:used', idx, used)
}

function onUpdateManeuverLost(idx: number, lost: boolean) {
  emits('update:lost', idx, lost)
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
