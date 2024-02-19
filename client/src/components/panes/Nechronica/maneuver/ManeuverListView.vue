<template>
  <v-sheet
    :max-width="`${columns * 60 + 64 + 4}px`"
    class="d-flex flex-column bg-transparent"
    style="box-sizing: content-box; gap: 5px"
  >
    <template v-for="(structure, idx) in structures" :key="idx">
      <template v-if="isViewParts(idx)">
        <v-sheet class="d-flex flex-row w-100 bg-transparent">
          <icon-btn :class="structure.headerClass" size="normal" :disable-button="true" />
          <v-sheet class="d-flex flex-row flex-wrap ml-3 bg-transparent" style="gap: 0.5rem">
            <template v-for="(maneuver, mIdx) in character.maneuverList" :key="mIdx">
              <template v-if="structure.isView(maneuver)">
                <maneuver-btn-menu
                  :character="character"
                  :maneuver="maneuver"
                  :type="type"
                  :view-label="viewOption?.viewLabel || ''"
                  :battle-timing="battleTiming"
                  @update:lost="v => emits('update:lost', mIdx, v)"
                  @update:used="(v, cost) => emits('update:used', mIdx, v, cost)"
                  @update:ignore-bravado="v => emits('update:ignore-bravado', mIdx, v)"
                  @update="v => emits('update', mIdx, v)"
                />
              </template>
            </template>
          </v-sheet>
        </v-sheet>
        <v-divider v-if="isViewParts(idx + 1)" />
      </template>
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
  (e: 'update:ignore-bravado', idx: number, value: boolean): Promise<void>
  (e: 'update', idx: number, maneuver: NechronicaManeuver): Promise<void>
}>()

const structures: { headerClass: string; isView: (maneuver: NechronicaManeuver) => boolean }[] = [
  {
    headerClass: 'parts-skill',
    isView: (maneuver: NechronicaManeuver): boolean => {
      if (!judgeView(maneuver)) return false
      return [1, 2, 3].includes(maneuver.parts)
    }
  },
  {
    headerClass: 'parts-head',
    isView: (maneuver: NechronicaManeuver): boolean => {
      if (!judgeView(maneuver)) return false
      return maneuver.parts === 4
    }
  },
  {
    headerClass: 'parts-arm',
    isView: (maneuver: NechronicaManeuver): boolean => {
      if (!judgeView(maneuver)) return false
      return maneuver.parts === 5
    }
  },
  {
    headerClass: 'parts-body',
    isView: (maneuver: NechronicaManeuver): boolean => {
      if (!judgeView(maneuver)) return false
      return maneuver.parts === 6
    }
  },
  {
    headerClass: 'parts-leg',
    isView: (maneuver: NechronicaManeuver): boolean => {
      if (!judgeView(maneuver)) return false
      return maneuver.parts === 7
    }
  },
  {
    headerClass: 'unknown',
    isView: (maneuver: NechronicaManeuver): boolean => {
      return ![1, 2, 3, 4, 5, 6, 7].includes(maneuver.parts)
    }
  }
]

function judgeView(maneuver: NechronicaManeuver) {
  if (!props.viewOption) return true
  if (maneuver.lost && !props.viewOption.viewLost) return false
  if (maneuver.used && !props.viewOption.viewUsed) return false
  if (props.viewOption.selectedTimings.every(t => t !== maneuver.timing)) return false
  return props.viewOption.selectedTypes.some(t => t === maneuver.type)
}

function getViewPartsNum(idx: number) {
  return props.character.maneuverList.filter(m => structures[idx].isView(m)).length
}

const isViewParts = (idx: number): boolean => {
  // スキル
  if (idx === 0) {
    return props.type === 'doll' || getViewPartsNum(0) > 0
  }

  // 部位不明
  if (idx === 5) {
    return getViewPartsNum(5) > 0
  }

  // 上記以外の部位は必ず表示（部位不明より大きいindexはfalse）
  return idx < 5
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
