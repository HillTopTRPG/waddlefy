<template>
  <v-menu :close-on-content-click="false" scroll-strategy="close">
    <template #activator="{ props }">
      <v-btn variant="text" class="text-body-1 px-0" v-bind="props">
        <div class="d-flex flex-row align-end underline">
          <span class="text-caption text-justify">行動値：</span>
          <span class="text-h5">{{ character?.data.actionValue || 0 }}/</span>
          <template v-if="maneuverLostActionValue + myselfRoiceActionValue + otherRoiveActionValue">
            <span class="text-h5">{{
              maneuverActionValue + maneuverLostActionValue + myselfRoiceActionValue + otherRoiveActionValue
            }}</span>
            <span class="text-body-1">=</span>
            <span class="text-body-1 text-info">{{ maneuverActionValue }}</span>
            <span class="text-body-1 text-error">{{
              maneuverLostActionValue + myselfRoiceActionValue + otherRoiveActionValue
            }}</span>
          </template>
          <template v-else>
            <span class="text-h5">{{ maneuverActionValue }}</span>
          </template>
        </div>
      </v-btn>
    </template>
    <v-card class="pa-2">
      <v-card-title class="pa-0">行動値</v-card-title>
      <v-card-text class="pa-0">
        <menu-edit-text-field
          :editable="true"
          :width="11"
          :min="-99"
          variant="solo-filled"
          label="行動値"
          type="number"
          :text="character?.data.actionValue?.toString() || '0'"
          @update="v => onUpdateActionValue(v)"
        />
      </v-card-text>
      <v-card-title class="px-0 pt-1 pb-0">最大行動値</v-card-title>
      <v-card-subtitle class="px-0" style="opacity: 1">
        <span style="opacity: 0.6">基礎値: </span>
        <span class="text-body-1 text-info font-weight-bold">{{ maneuverActionValue }}</span>
        <span class="text-body-1 text-error font-weight-bold" v-if="maneuverLostActionValue">{{
          maneuverLostActionValue
        }}</span>
      </v-card-subtitle>
      <v-card-text class="px-0 py-1 d-flex flex-row align-end flex-wrap">
        <span class="pb-1 d-flex flex-column align-center" style="line-height: 20px; font-size: 13px">
          <span style="opacity: 0.6">基本値</span>
          <span class="text-body-1 text-info font-weight-bold">６</span>
          <v-spacer v-if="hasHeiki && actionValueManeuvers.some(m => m.lost)" style="min-height: 28px" />
        </span>
        <template v-for="(maneuver, idx) in character?.data.character.maneuverList || []" :key="idx">
          <v-sheet v-if="maneuver.type === 3" class="d-flex flex-column align-center pa-1">
            <maneuver-btn-menu
              :character="character!.data.character"
              :disable-button="true"
              :maneuver="maneuver"
              :type="character!.data.type"
              @update:lost="v => onUpdateManeuverLost(characterId, idx, v)"
              @update:used="(v, cost) => onUpdateManeuverUsed(characterId, idx, v, cost)"
              @update:ignore-heiki="v => onUpdateManeuverIgnoreHeiki(characterId, idx, v)"
            />
            <span
              class="text-body-1 font-weight-bold"
              :class="!maneuver.lost || (hasHeiki && !maneuver.ignoreHeiki) ? 'text-info' : 'text-grey'"
            >
              {{ `+${getActionValueNum(maneuver.memo)}` }}
            </span>
            <heiki-btn
              :ignore-heiki="maneuver.ignoreHeiki"
              v-if="hasHeiki && maneuver.lost"
              @click="onUpdateManeuverIgnoreHeiki(characterId, idx, !maneuver.ignoreHeiki)"
            />
            <template v-else>
              <v-spacer v-if="hasHeiki && actionValueManeuvers.some(m => m.lost)" style="min-height: 28px" />
            </template>
          </v-sheet>
        </template>
      </v-card-text>
      <template v-if="character?.data.type === 'doll'">
        <v-card-subtitle class="pa-0" style="opacity: 1">
          <span style="opacity: 0.6">本人の未練: </span>
          <span class="text-body-1" :class="myselfRoiceActionValue ? 'font-weight-bold text-error' : ''">{{
            myselfRoiceActionValue
          }}</span>
        </v-card-subtitle>
        <v-card-text class="px-0 pt-1 pb-3 d-flex flex-row align-end flex-wrap" style="gap: 0.5rem">
          <template v-for="(roice, idx) in actionValueRoices" :key="idx">
            <roice-badge :roice="roice" @update="updateRoice => onUpdateRoice(characterId, idx, updateRoice)" />
          </template>
        </v-card-text>
      </template>
      <template v-for="(info, infoIdx) in otherRoices" :key="infoIdx">
        <v-card-subtitle class="pa-0" style="opacity: 1">
          <span style="opacity: 0.6">{{ info.character.data.character.basic.characterName }}の未練: </span>
          <span class="text-body-1 font-weight-bold text-error">{{ info.actionValue }}</span>
        </v-card-subtitle>
        <v-card-text class="px-0 py-1 d-flex flex-row align-end flex-wrap">
          <template v-for="(roice, idx) in info.roiceList" :key="idx">
            <roice-badge
              :roice="roice.roice"
              @update="updateRoice => onUpdateRoice(info.character.id, roice.index, updateRoice)"
            />
          </template>
        </v-card-text>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import {
  getActionValueNum,
  NechronicaManeuver,
  NechronicaRoice,
  NechronicaWrap
} from '@/components/panes/Nechronica/nechronica'
import { computed, inject } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import HeikiBtn from '@/components/panes/Nechronica/component/HeikiBtn.vue'
import ManeuverBtnMenu from '@/components/panes/Nechronica/maneuver/ManeuverBtnMenu.vue'
import RoiceBadge from '@/components/panes/Nechronica/roice/RoiceBadge.vue'
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  characterId: string
}>()

const emits = defineEmits<{
  (e: 'update:action-value', value: number): Promise<void>
  (e: 'update:maneuver-used', characterId: string, idx: number, value: boolean, cost: number): Promise<void>
  (e: 'update:maneuver-lost', characterId: string, idx: number, value: boolean): Promise<void>
  (e: 'update:maneuver-ignore-heiki', characterId: string, idx: number, value: boolean): Promise<void>
  (e: 'update:roice', characterId: string, idx: number, roice: NechronicaRoice): Promise<void>
}>()

const character = computed((): { id: string; data: NechronicaWrap } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
})

const hasHeiki = computed(() => {
  return character.value?.data.character.maneuverList.some(m => m.isHeiki)
})

const actionValueManeuvers = computed((): NechronicaManeuver[] => {
  return character.value?.data.character.maneuverList.filter(m => m.type === 3) || []
})
const maneuverActionValue = computed((): number => {
  return actionValueManeuvers.value.reduce((p, c) => p + getActionValueNum(c.memo), 6) || 0
})
const maneuverLostActionValue = computed((): number => {
  return (
    -actionValueManeuvers.value.reduce(
      (p, c) => (!c.lost || (hasHeiki.value && !c.ignoreHeiki) ? p : p + getActionValueNum(c.memo)),
      0
    ) || 0
  )
})

const actionValueRoices = computed((): NechronicaRoice[] => {
  return character.value?.data.character.roiceList.filter(r => r.id % 10 === 3) || []
})
const myselfRoiceActionValue = computed((): number => {
  return -actionValueRoices.value.filter(r => r.damage === 4).length * 2
})

type OtherRoiceInfo = {
  character: { id: string; data: NechronicaWrap }
  roiceList: {
    index: number
    roice: NechronicaRoice
  }[]
  actionValue: number
}

const otherRoices = computed((): OtherRoiceInfo[] => {
  if (character.value?.data.type !== 'doll') return []
  return (
    graphQlStore?.state.sessionDataList
      .filter(sd => sd.type === 'nechronica-character' && sd.data.type === 'doll' && sd.id !== props.characterId)
      .map((c: { id: string; data: NechronicaWrap }): OtherRoiceInfo => {
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

function onUpdateActionValue(v: string) {
  emits('update:action-value', parseInt(v, 10))
}

function onUpdateManeuverUsed(characterId: string, idx: number, used: boolean, cost: number) {
  emits('update:maneuver-used', characterId, idx, used, cost)
}

function onUpdateManeuverLost(characterId: string, idx: number, lost: boolean) {
  emits('update:maneuver-lost', characterId, idx, lost)
}

function onUpdateManeuverIgnoreHeiki(characterId: string, idx: number, value: boolean) {
  emits('update:maneuver-ignore-heiki', characterId, idx, value)
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
