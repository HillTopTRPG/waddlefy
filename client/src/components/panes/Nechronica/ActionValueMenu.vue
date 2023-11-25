<template>
  <v-menu :close-on-content-click="false" scroll-strategy="close">
    <template #activator="{ props }">
      <v-btn variant="text" class="text-body-1 px-0" :text="`行動値：${actionValue}`" v-bind="props">
        <div class="d-flex flex-row align-end underline">
          <span class="text-caption">行動値：</span>
          <span class="text-h5">{{ actionValue }}</span>
        </div>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>行動値</v-card-title>
      <v-card-text class="d-flex flex-row align-end flex-wrap">
        <span class="pb-1 text-center" style="line-height: 20px; font-size: 13px">基本値<br />６</span>
        <template v-for="(maneuver, idx) in character.maneuverList" :key="idx">
          <v-sheet
            v-if="maneuver.type === 3"
            class="d-flex flex-column align-center pa-1"
            :class="maneuver.lost ? 'bg-grey' : ''"
          >
            <maneuver-btn-menu
              :character="character"
              :disable-button="true"
              :maneuver="maneuver"
              @update:lost="v => onUpdateManeuverLost(idx, v)"
              @update:used="v => onUpdateManeuverUsed(idx, v)"
            />
            <span>{{ convertNumberZero(maneuver.memo) }}</span>
          </v-sheet>
        </template>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { Nechronica } from '@/components/panes/Nechronica/nechronica'
import { computed } from 'vue'

import ManeuverBtnMenu from '@/components/panes/Nechronica/ManeuverBtnMenu.vue'
import { convertNumberZero } from '@/components/panes/PrimaryDataUtility'


// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  character: Nechronica
}>()

const emits = defineEmits<{
  (e: 'update:used', idx: number, value: boolean): Promise<void>
  (e: 'update:lost', idx: number, value: boolean): Promise<void>
}>()

const actionValue = computed(() => {
  return (
    props.character.maneuverList.reduce((prev, current) => {
      if (current.type === 3 && !current.lost) {
        return prev + convertNumberZero(current.memo)
      }
      return prev
    }, 6) || 0
  )
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
