<template>
  <v-card
    class="px-0 py-1 rounded-lg"
    border
    style="outline-width: 3px; outline-offset: -3px; outline-style: solid"
    :style="`outline-color: ${NechronicaPowerList[maneuver.type].color}`"
    variant="flat"
  >
    <v-defaults-provider :defaults="{ VSelect: vSelectDefaults }">
      <v-card-actions class="py-1" style="gap: 0.5rem">
        <v-select
          :items="typeSelection"
          :color="NechronicaPowerList[maneuver.type].color"
          :model-value="maneuver.type"
          @update:model-value="v => onUpdateType(v)"
        >
          <template #label>
            <v-icon icon="mdi-cards-spade-outline" class="mr-1" />
            カテゴリ
          </template>
        </v-select>
        <v-select :items="partsSelection" :model-value="maneuver.parts" @update:model-value="v => onUpdateParts(v)">
          <template #label>
            <v-icon icon="mdi-hand-back-right-outline" class="mr-1" />
            部位
          </template>
        </v-select>
      </v-card-actions>
      <v-card-text class="px-2 py-1">
        <menu-edit-text-field
          :editable="true"
          variant="solo-filled"
          :width="width"
          icon="mdi-puzzle"
          label="マニューバ"
          :text="maneuver.name"
          @update="onUpdateName"
        />
      </v-card-text>
      <v-card-text class="px-2 py-1 d-flex flex-row" style="gap: 0.5rem">
        <v-select
          :items="timingSelection"
          style="max-width: 9em"
          :model-value="maneuver.timing"
          @update:model-value="v => onUpdateTiming(v)"
        >
          <template #label>
            <v-icon icon="mdi-timer-outline" class="mr-1" />
            タイミング
          </template>
        </v-select>
        <menu-edit-text-field
          :editable="true"
          variant="solo-filled"
          :width="5"
          icon="mdi-run"
          label="コスト"
          :text="maneuver.cost"
          @update="onUpdateCost"
        />
        <menu-edit-text-field
          :editable="true"
          variant="solo-filled"
          :width="5"
          icon="mdi-arrow-expand-vertical"
          label="射程"
          :text="maneuver.range"
          @update="onUpdateRange"
        />
      </v-card-text>
      <v-card-text class="px-2 py-1">
        <menu-edit-text-area
          :editable="true"
          icon="mdi-script-text-outline"
          variant="solo-filled"
          :text-rows="3"
          :width="width"
          label="効果"
          :text="maneuver.memo"
          :offset="-2 * 24"
          @update="onUpdateMemo"
        />
      </v-card-text>
      <v-card-text class="px-2 py-1">
        <menu-edit-text-field
          :editable="true"
          variant="solo-filled"
          :width="width"
          icon="mdi-package-variant"
          label="取得先"
          :text="maneuver.shozoku"
          @update="onUpdateShozoku"
        />
      </v-card-text>
    </v-defaults-provider>
  </v-card>
</template>

<script setup lang="ts">
import {
  NechronicaManeuver,
  NechronicaPartsList,
  NechronicaPowerList,
  NechronicaTimingList
} from '@/components/panes/Nechronica/nechronica'
import { clone } from '@/components/panes/PrimaryDataUtility'
import MenuEditTextArea from '@/components/parts/MenuEditTextArea.vue'
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'

const vSelectDefaults = {
  hideDetails: true,
  persistentPlaceholder: true,
  itemTitle: 'text',
  style: 'color: black',
  itemValue: 'value',
  variant: 'solo'
}

const width = 20

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  maneuver: NechronicaManeuver
}>()

const emits = defineEmits<{
  (e: 'update', maneuver: NechronicaManeuver): void
}>()

const partsSelection = NechronicaPartsList.map((p, idx) => ({
  value: idx,
  text: p
}))

const typeSelection = NechronicaPowerList.map((p, idx) => ({
  value: idx,
  text: p.text
}))

const timingSelection = NechronicaTimingList.map((t, idx) => ({
  value: idx,
  text: t.text
}))

function updateHelper(wrapFunc: (m: NechronicaManeuver) => boolean) {
  const updateManeuver = clone(props.maneuver)!
  if (!wrapFunc(updateManeuver)) return
  emits('update', updateManeuver)
}

function onUpdateName(name: string) {
  updateHelper(m => {
    if (m.name === name) return false
    m.name = name
    return true
  })
}

function onUpdateCost(cost: string) {
  updateHelper(m => {
    if (m.cost === cost) return false
    m.cost = cost
    return true
  })
}

function onUpdateType(type: number) {
  updateHelper(m => {
    if (m.type === type) return false
    m.type = type
    return true
  })
}

function onUpdateParts(parts: number) {
  updateHelper(m => {
    if (m.parts === parts) return false
    m.parts = parts
    return true
  })
}

function onUpdateTiming(timing: number) {
  updateHelper(m => {
    if (m.timing === timing) return false
    m.timing = timing
    return true
  })
}

function onUpdateRange(range: string) {
  updateHelper(m => {
    if (m.range === range) return false
    m.range = range
    return true
  })
}

function onUpdateMemo(memo: string) {
  updateHelper(m => {
    if (m.memo === memo) return false
    m.memo = memo
    return true
  })
}

function onUpdateShozoku(shozoku: string) {
  updateHelper(m => {
    if (m.shozoku === shozoku) return false
    m.shozoku = shozoku
    return true
  })
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
