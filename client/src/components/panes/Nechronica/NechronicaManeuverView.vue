<template>
  <v-sheet
    :max-width="`${(columns + 1) * 4}rem`"
    class="d-flex flex-column bg-transparent"
    style="box-sizing: content-box; gap: 5px"
  >
    <v-divider />
    <v-sheet class="d-flex flex-row w-100 bg-transparent">
      <nechronica-icon-btn class="skill" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="[1, 2, 3].some(n => n === maneuver.parts) && judgeView(maneuver)">
            <nechronica-maneuver-btn-menu
              :character="character"
              :maneuver="maneuver"
              :view-label="viewOption.viewLabel"
              @update:lost="v => emits('update:lost', mIdx, v)"
              @update:used="v => emits('update:used', mIdx, v)"
            />
          </template>
        </template>
      </v-sheet>
    </v-sheet>
    <v-divider />
    <v-sheet class="d-flex flex-row w-100 bg-transparent">
      <nechronica-icon-btn class="head" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="maneuver.parts === 4 && judgeView(maneuver)">
            <nechronica-maneuver-btn-menu
              :character="character"
              :maneuver="maneuver"
              :view-label="viewOption.viewLabel"
              @update:lost="v => emits('update:lost', mIdx, v)"
              @update:used="v => emits('update:used', mIdx, v)"
            />
          </template>
        </template>
      </v-sheet>
    </v-sheet>
    <v-divider />
    <v-sheet class="d-flex flex-row w-100 bg-transparent">
      <nechronica-icon-btn class="arm" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="maneuver.parts === 5 && judgeView(maneuver)">
            <nechronica-maneuver-btn-menu
              :character="character"
              :maneuver="maneuver"
              :view-label="viewOption.viewLabel"
              @update:lost="v => emits('update:lost', mIdx, v)"
              @update:used="v => emits('update:used', mIdx, v)"
            />
          </template>
        </template>
      </v-sheet>
    </v-sheet>
    <v-divider />
    <v-sheet class="d-flex flex-row w-100 bg-transparent">
      <nechronica-icon-btn class="body" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="maneuver.parts === 6 && judgeView(maneuver)">
            <nechronica-maneuver-btn-menu
              :character="character"
              :maneuver="maneuver"
              :view-label="viewOption.viewLabel"
              @update:lost="v => emits('update:lost', mIdx, v)"
              @update:used="v => emits('update:used', mIdx, v)"
            />
          </template>
        </template>
      </v-sheet>
    </v-sheet>
    <v-divider />
    <v-sheet class="d-flex flex-row w-100 bg-transparent">
      <nechronica-icon-btn class="leg" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="maneuver.parts === 7 && judgeView(maneuver)">
            <nechronica-maneuver-btn-menu
              :character="character"
              :maneuver="maneuver"
              :view-label="viewOption.viewLabel"
              @update:lost="v => emits('update:lost', mIdx, v)"
              @update:used="v => emits('update:used', mIdx, v)"
            />
          </template>
        </template>
      </v-sheet>
    </v-sheet>
    <v-divider />
  </v-sheet>
</template>

<script setup lang="ts">
import NechronicaIconBtn from '@/components/panes/Nechronica/NechronicaIconBtn.vue'
import NechronicaManeuverBtnMenu from '@/components/panes/Nechronica/NechronicaManeuverBtnMenu.vue'
import { NechronicaViewOption } from '@/components/panes/Nechronica/NechronicaViewOptionNav.vue'
import { Nechronica, NechronicaManeuver } from '@/components/panes/Nechronica/nechronica'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  character: Nechronica
  columns: number
  viewOption: NechronicaViewOption
}>()

const emits = defineEmits<{
  (e: 'update:used', idx: number, value: boolean): Promise<void>
  (e: 'update:lost', idx: number, value: boolean): Promise<void>
}>()

function judgeView(maneuver: NechronicaManeuver) {
  if (props.viewOption.selectedTimings.every(t => t !== maneuver.timing)) return false
  if (props.viewOption.selectedTypes.every(t => t !== maneuver.type)) return false
  if (maneuver.lost && !props.viewOption.viewLost) return false
  if (maneuver.used && !props.viewOption.viewUsed) return false
  return true
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.maneuver-container {
  gap: 12px;
}
</style>
