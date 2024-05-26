<template>
  <v-menu :close-on-content-click="false" scroll-strategy="close">
    <template #activator="{ props }">
      <v-btn variant="text" class="text-body-1 px-0" v-bind="props">
        <div class="d-flex flex-row align-end border border-b-sm border-opacity-100 border-t-0 border-s-0 border-e-0">
          <span class="text-caption text-justify">{{ $t('Nechronica.label.action-value') }}: </span>
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
      <v-card-title class="pa-0">{{ $t('Nechronica.label.action-value') }}</v-card-title>
      <v-card-text class="pa-0">
        <menu-edit-text-field
          :editable="true"
          :width="11"
          :min="-99"
          variant="solo-filled"
          :label="$t('Nechronica.label.action-value')"
          type="number"
          :text="character?.data.actionValue?.toString() || '0'"
          @update="v => onUpdateActionValue(v)"
        />
      </v-card-text>
      <v-card-title class="px-0 pt-1 pb-0">{{ $t('Nechronica.label.max-action-value') }}</v-card-title>
      <v-card-subtitle class="px-0" style="opacity: 1">
        <span style="opacity: 0.6">{{ $t('Nechronica.label.action-value-base-value') }}: </span>
        <span class="text-body-1 text-info font-weight-bold">{{ maneuverActionValue }}</span>
        <span class="text-body-1 text-error font-weight-bold" v-if="maneuverLostActionValue">{{
          maneuverLostActionValue
        }}</span>
      </v-card-subtitle>
      <v-card-text class="px-0 py-1 d-flex flex-row align-end flex-wrap">
        <span class="pb-1 d-flex flex-column align-center" style="line-height: 20px; font-size: 13px">
          <span style="opacity: 0.6">{{ $t('Nechronica.label.action-value-start-value') }}</span>
          <span class="text-body-1 text-info font-weight-bold">6</span>
          <v-spacer v-if="hasBravado && actionValueManeuvers.some(m => m.lost)" style="min-height: 28px" />
        </span>
        <template v-for="(maneuver, idx) in character?.data.character.maneuverList || []" :key="idx">
          <v-sheet v-if="!maneuver.isUnknown && maneuver.type === 3" class="d-flex flex-column align-center pa-1">
            <maneuver-btn-menu
              :character="character!.data.character"
              :disable-button="true"
              :maneuver="maneuver"
              :type="character!.data.type"
              :perspective="perspective"
              @update:lost="v => onUpdateManeuverLost(characterId, idx, v)"
              @update:used="(v, cost) => onUpdateManeuverUsed(characterId, idx, v, cost)"
              @update:unknown="v => onUpdateManeuverUnknown(characterId, idx, v)"
              @update:ignore-bravado="v => onUpdateManeuverIgnoreBravado(characterId, idx, v)"
              @delete="emits('delete', characterId, idx)"
            />
            <span
              class="text-body-1 font-weight-bold"
              :class="!maneuver.lost || (hasBravado && !maneuver.ignoreBravado) ? 'text-info' : 'text-grey'"
            >
              {{ `+${getActionValueNum(maneuver.memo)}` }}
            </span>
            <bravado-btn
              :ignore-bravado="maneuver.ignoreBravado"
              v-if="hasBravado && maneuver.lost"
              @click="onUpdateManeuverIgnoreBravado(characterId, idx, !maneuver.ignoreBravado)"
            />
            <template v-else>
              <v-spacer v-if="hasBravado && actionValueManeuvers.some(m => m.lost)" style="min-height: 28px" />
            </template>
          </v-sheet>
        </template>
      </v-card-text>
      <template v-if="character?.data.type === 'doll'">
        <v-card-subtitle class="pa-0" style="opacity: 1">
          <span style="opacity: 0.6">{{ $t('Nechronica.label.personal-roice') }}: </span>
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
          <span style="opacity: 0.6"
            >{{
              `${$t('Nechronica.label.of-roice').replace('$$', info.character.data.character.basic.characterName)}`
            }}:
          </span>
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
import BravadoBtn from '@/components/panes/Nechronica/component/BravadoBtn.vue'
import ManeuverBtnMenu from '@/components/panes/Nechronica/maneuver/ManeuverBtnMenu.vue'
import RoiceBadge from '@/components/panes/Nechronica/roice/RoiceBadge.vue'
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  characterId: string
  perspective: string
}>()

const emits = defineEmits<{
  (e: 'update:action-value', value: number): Promise<void>
  (e: 'update:maneuver-used', characterId: string, idx: number, value: boolean, cost: number): Promise<void>
  (e: 'update:maneuver-lost', characterId: string, idx: number, value: boolean): Promise<void>
  (e: 'update:maneuver-unknown', characterId: string, idx: number, value: boolean): Promise<void>
  (e: 'update:maneuver-ignore-bravado', characterId: string, idx: number, value: boolean): Promise<void>
  (e: 'delete', characterId: string, idx: number): Promise<void>
  (e: 'update:roice', characterId: string, idx: number, roice: NechronicaRoice): Promise<void>
}>()

const character = computed((): { id: string; data: NechronicaWrap } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
})

const hasBravado = computed(() => {
  return character.value?.data.character.maneuverList.some(m => !m.isUnknown && !m.lost && m.isBravado)
})

const actionValueManeuvers = computed((): NechronicaManeuver[] => {
  return character.value?.data.character.maneuverList?.filter(m => !m.isUnknown && m.type === 3) || []
})
const maneuverActionValue = computed((): number => {
  return actionValueManeuvers.value.reduce((p, c) => p + getActionValueNum(c.memo), 6) || 0
})
const maneuverLostActionValue = computed((): number => {
  return (
    -actionValueManeuvers.value.reduce(
      (p, c) => (!c.lost || (hasBravado.value && !c.ignoreBravado) ? p : p + getActionValueNum(c.memo)),
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

function onUpdateManeuverUnknown(characterId: string, idx: number, isUnknown: boolean) {
  emits('update:maneuver-unknown', characterId, idx, isUnknown)
}

function onUpdateManeuverIgnoreBravado(characterId: string, idx: number, value: boolean) {
  emits('update:maneuver-ignore-bravado', characterId, idx, value)
}

function onUpdateRoice(characterId: string, idx: number, roice: NechronicaRoice) {
  emits('update:roice', characterId, idx, roice)
}
</script>

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
