<template>
  <v-sheet
    :max-width="`${(columns + 1) * 4}rem`"
    class="d-flex flex-column bg-transparent"
    style="box-sizing: content-box; gap: 5px"
  >
    <v-divider />
    <v-sheet class="d-flex flex-row w-100 bg-transparent">
      <nechronica-icon-btn class="maneuver-header part-skill" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="[1, 2, 3].some(n => n === maneuver.parts)">
            <nechronica-maneuver-btn-menu
              :character="character"
              :maneuver="maneuver"
              :view-label="viewLabel"
              @update:lost="v => emits('update:lost', mIdx, v)"
              @update:used="v => emits('update:used', mIdx, v)"
            />
          </template>
        </template>
      </v-sheet>
    </v-sheet>
    <v-divider />
    <v-sheet class="d-flex flex-row w-100 bg-transparent">
      <nechronica-icon-btn class="maneuver-header part-head" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="maneuver.parts === 4">
            <nechronica-maneuver-btn-menu
              :character="character"
              :maneuver="maneuver"
              :view-label="viewLabel"
              @update:lost="v => emits('update:lost', mIdx, v)"
              @update:used="v => emits('update:used', mIdx, v)"
            />
          </template>
        </template>
      </v-sheet>
    </v-sheet>
    <v-divider />
    <v-sheet class="d-flex flex-row w-100 bg-transparent">
      <nechronica-icon-btn class="maneuver-header part-arm" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="maneuver.parts === 5">
            <nechronica-maneuver-btn-menu
              :character="character"
              :maneuver="maneuver"
              :view-label="viewLabel"
              @update:lost="v => emits('update:lost', mIdx, v)"
              @update:used="v => emits('update:used', mIdx, v)"
            />
          </template>
        </template>
      </v-sheet>
    </v-sheet>
    <v-divider />
    <v-sheet class="d-flex flex-row w-100 bg-transparent">
      <nechronica-icon-btn class="maneuver-header part-body" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="maneuver.parts === 6">
            <nechronica-maneuver-btn-menu
              :character="character"
              :maneuver="maneuver"
              :view-label="viewLabel"
              @update:lost="v => emits('update:lost', mIdx, v)"
              @update:used="v => emits('update:used', mIdx, v)"
            />
          </template>
        </template>
      </v-sheet>
    </v-sheet>
    <v-divider />
    <v-sheet class="d-flex flex-row w-100 bg-transparent">
      <nechronica-icon-btn class="maneuver-header part-leg" :disable-button="true" />
      <v-sheet class="maneuver-container d-flex flex-row flex-wrap ml-3 bg-transparent">
        <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
          <template v-if="maneuver.parts === 7">
            <nechronica-maneuver-btn-menu
              :character="character"
              :maneuver="maneuver"
              :view-label="viewLabel"
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
import { Nechronica } from '@/components/panes/Nechronica/nechronica'

// eslint-disable-next-line unused-imports/no-unused-vars
defineProps<{
  character: Nechronica
  columns: number
  viewLabel: string
}>()

const emits = defineEmits<{
  (e: 'update:used', idx: number, value: boolean): Promise<void>
  (e: 'update:lost', idx: number, value: boolean): Promise<void>
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.maneuver-container {
  gap: 12px;
}
</style>
