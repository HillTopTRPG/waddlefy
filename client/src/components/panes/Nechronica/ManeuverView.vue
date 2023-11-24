<template>
  <v-sheet
    :max-width="`${(columns + 1) * 4}rem`"
    class="d-flex flex-column bg-transparent"
    style="box-sizing: content-box; gap: 5px"
  >
    <v-divider />
    <v-sheet class="d-flex flex-row w-100 bg-transparent">
      <icon-btn class="skill" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="[1, 2, 3].some(n => n === maneuver.parts) && judgeView(maneuver)">
            <maneuver-btn-menu
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
      <icon-btn class="head" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="maneuver.parts === 4 && judgeView(maneuver)">
            <maneuver-btn-menu
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
      <icon-btn class="arm" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="maneuver.parts === 5 && judgeView(maneuver)">
            <maneuver-btn-menu
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
      <icon-btn class="body" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="maneuver.parts === 6 && judgeView(maneuver)">
            <maneuver-btn-menu
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
      <icon-btn class="leg" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="maneuver.parts === 7 && judgeView(maneuver)">
            <maneuver-btn-menu
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
import IconBtn from '@/components/panes/Nechronica/IconBtn.vue'
import ManeuverBtnMenu from '@/components/panes/Nechronica/ManeuverBtnMenu.vue'
import { NechronicaViewOption } from '@/components/panes/Nechronica/ViewOptionNav.vue'
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
  if (maneuver.lost && !props.viewOption.viewLost) return false
  if (maneuver.used && !props.viewOption.viewUsed) return false
  if (props.viewOption.selectedTimings.every(t => t !== maneuver.timing)) return false
  return props.viewOption.selectedTypes.some(t => t === maneuver.type)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.maneuver-container {
  gap: 12px;
}
</style>
