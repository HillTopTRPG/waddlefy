<template>
  <v-sheet
    :max-width="`${columns * 60 + 64 + 4}px`"
    class="d-flex flex-column bg-transparent"
    style="box-sizing: content-box; gap: 5px"
  >
    <template v-for="(structure, idx) in structures" :key="idx">
      <v-divider v-if="idx" />
      <v-sheet class="d-flex flex-row w-100 bg-transparent">
        <icon-btn :class="structure.headerClass" size="normal" :disable-button="true" />
        <v-sheet class="d-flex flex-row flex-wrap ml-3 bg-transparent" style="gap: 0.5rem">
          <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
            <template v-if="structure.targetParts.some(n => n === maneuver.parts) && judgeView(maneuver)">
              <maneuver-btn-menu
                :character="character"
                :maneuver="maneuver"
                :type="type"
                :view-label="viewOption?.viewLabel || ''"
                :battle-timing="battleTiming"
                @update:lost="v => emits('update:lost', mIdx, v)"
                @update:used="(v, cost) => emits('update:used', mIdx, v, cost)"
                @update:ignore-heiki="v => emits('update:ignore-heiki', mIdx, v)"
                @update="v => emits('update', mIdx, v)"
              />
            </template>
          </template>
        </v-sheet>
      </v-sheet>
    </template>
  </v-sheet>
</template>

<script setup lang="ts">
import { NechronicaViewOption } from '@/components/panes/Nechronica/component/ViewOptionNav.vue'
import IconBtn from '@/components/panes/Nechronica/maneuver/IconBtn.vue'
import ManeuverBtnMenu from '@/components/panes/Nechronica/maneuver/ManeuverBtnMenu.vue'
import { Nechronica, NechronicaManeuver, NechronicaType } from '@/components/panes/Nechronica/nechronica'

const props = defineProps<{
  character: Nechronica
  columns: number
  type: NechronicaType
  viewOption: NechronicaViewOption | null
  battleTiming: string
}>()

const emits = defineEmits<{
  (e: 'update:used', idx: number, value: boolean, cost: number): Promise<void>
  (e: 'update:lost', idx: number, value: boolean): Promise<void>
  (e: 'update:ignore-heiki', idx: number, value: boolean): Promise<void>
  (e: 'update', idx: number, maneuver: NechronicaManeuver): Promise<void>
}>()

const structures = [
  { headerClass: 'skill', targetParts: [1, 2, 3] },
  { headerClass: 'head', targetParts: [4] },
  { headerClass: 'arm', targetParts: [5] },
  { headerClass: 'body', targetParts: [6] },
  { headerClass: 'leg', targetParts: [7] }
]

function judgeView(maneuver: NechronicaManeuver) {
  if (!props.viewOption) return true
  if (maneuver.lost && !props.viewOption.viewLost) return false
  if (maneuver.used && !props.viewOption.viewUsed) return false
  if (props.viewOption.selectedTimings.every(t => t !== maneuver.timing)) return false
  return props.viewOption.selectedTypes.some(t => t === maneuver.type)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
