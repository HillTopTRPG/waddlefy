<template>
  <v-card
    class="px-0 py-1 rounded-lg"
    style="outline-width: 3px; outline-offset: -3px; outline-style: solid"
    :style="`outline-color: ${mapping.MANEUVER_TYPE[maneuver.type].color}`"
    variant="flat"
    v-if="mode === 'edit'"
  >
    <v-card-text class="d-flex flex-row align-center py-1 px-2">
      <span class="text-body-1">{{ $t('Nechronica.label.edit-maneuver') }}</span>
      <v-spacer />
      <v-btn
        icon="mdi-eye-outline"
        density="comfortable"
        size="small"
        :flat="true"
        @click="emits('update:mode', 'view')"
      />
    </v-card-text>
    <v-defaults-provider :defaults="{ VSelect: vSelectDefaults }">
      <v-card-actions class="py-0" style="gap: 0.5rem">
        <v-select
          v-ripple
          :items="typeSelection"
          :color="mapping.MANEUVER_TYPE[maneuver.type].color"
          :model-value="maneuver.type"
          @update:model-value="v => v !== null && onUpdateType(v)"
        >
          <template #label>
            <v-icon icon="mdi-cards-spade-outline" class="mr-1" />
            {{ $t('Nechronica.label.category') }}
          </template>
        </v-select>
        <v-select
          v-ripple
          :items="partsSelection"
          :model-value="maneuver.parts"
          @update:model-value="v => v !== null && onUpdateParts(v)"
        >
          <template #label>
            <v-icon icon="mdi-hand-back-right-outline" class="mr-1" />
            {{ $t('Nechronica.label.parts-position') }}
          </template>
        </v-select>
      </v-card-actions>
      <v-card-text class="px-2 py-1">
        <menu-edit-text-field
          :editable="true"
          variant="solo-filled"
          :width="width"
          icon="mdi-puzzle"
          :label="$t('Nechronica.label.maneuver')"
          :text="maneuver.name"
          @update="onUpdateName"
        />
      </v-card-text>
      <v-card-text class="px-2 py-1 d-flex flex-row" style="gap: 0.5rem">
        <v-select
          v-ripple
          :items="timingSelection"
          style="max-width: 9em"
          :model-value="maneuver.timing"
          @update:model-value="v => v !== null && onUpdateTiming(v)"
        >
          <template #label>
            <v-icon icon="mdi-timer-outline" class="mr-1" />
            {{ $t('Nechronica.label.timing') }}
          </template>
        </v-select>
        <menu-edit-text-field
          :editable="true"
          variant="solo-filled"
          :width="5"
          icon="mdi-run"
          :label="$t('Nechronica.label.cost')"
          :text="maneuver.cost"
          @update="onUpdateCost"
        />
        <menu-edit-text-field
          :editable="true"
          variant="solo-filled"
          :width="5"
          icon="mdi-arrow-expand-vertical"
          :label="$t('Nechronica.label.range')"
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
          :label="$t('Nechronica.label.effect')"
          :text="maneuver.memo"
          :offset="-2 * 24"
          @update="onUpdateMemo"
        />
      </v-card-text>
      <v-card-text class="px-2 pt-1 pb-0">
        <menu-edit-text-field
          :editable="true"
          variant="solo-filled"
          :width="width"
          icon="mdi-package-variant"
          :label="$t('Nechronica.label.source')"
          :text="maneuver.shozoku"
          @update="onUpdateShozoku"
        />
      </v-card-text>
      <v-card-text class="px-2 py-0">
        <v-switch
          :label="$t('Nechronica.label.treat-as-bravado')"
          color="primary"
          true-icon="mdi-emoticon-tongue"
          :hide-details="true"
          density="compact"
          class="ml-2"
          :model-value="maneuver.isBravado || false"
          @update:model-value="(v: any) => onUpdateIsBravado(v as boolean)"
        />
      </v-card-text>
    </v-defaults-provider>
  </v-card>
</template>

<script setup lang="ts">
import mapping from '@/components/panes/Nechronica/mapping.json'
import { NechronicaManeuver } from '@/components/panes/Nechronica/nechronica'

import { clone } from '@/components/panes/PrimaryDataUtility'
import MenuEditTextArea from '@/components/parts/MenuEditTextArea.vue'
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const vSelectDefaults = {
  hideDetails: true,
  persistentPlaceholder: true,
  itemTitle: 'text',
  style: 'color: black',
  itemValue: 'value',
  variant: 'solo'
}

const width = 20

const props = defineProps<{
  maneuver: NechronicaManeuver
  mode: 'view' | 'edit'
  perspective: string
}>()

const emits = defineEmits<{
  (e: 'update', maneuver: NechronicaManeuver): void
  (e: 'update:mode', mode: 'view' | 'edit'): void
}>()

const partsSelection = mapping.MANEUVER_PARTS.map((p, idx) => ({
  value: idx,
  text: p
}))

const typeSelection = mapping.MANEUVER_TYPE.map((p, idx) => ({
  value: idx,
  text: t(p.text)
}))

const timingSelection = mapping.MANEUVER_TIMING.map((p, idx) => ({
  value: idx,
  text: t(p.text)
}))

function updateHelper(wrapFunc: (m: NechronicaManeuver) => boolean) {
  const updateManeuver = clone(props.maneuver)!
  if (!wrapFunc(updateManeuver)) return
  emits('update', updateManeuver)
}

function onUpdateName(name: string) {
  updateHelper(m => {
    if (m.name === name.trim()) return false
    m.name = name.trim()
    return true
  })
}

function onUpdateCost(cost: string) {
  updateHelper(m => {
    if (m.cost === cost.trim()) return false
    m.cost = cost.trim()
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
    if (m.range === range.trim()) return false
    m.range = range.trim()
    return true
  })
}

function onUpdateMemo(memo: string) {
  updateHelper(m => {
    if (m.memo === memo.trim()) return false
    m.memo = memo.trim()
    return true
  })
}

function onUpdateShozoku(shozoku: string) {
  updateHelper(m => {
    const trimedShozoku = shozoku.trim()
    if (m.shozoku === trimedShozoku) return false

    if (m.shozoku.includes('隠匿') && m.isUnknown && !trimedShozoku.includes('隠匿')) {
      m.isUnknown = false
    }

    m.shozoku = trimedShozoku
    return true
  })
}

function onUpdateIsBravado(isBravado: boolean) {
  updateHelper(m => {
    if (m.isBravado === isBravado) return false
    m.isBravado = isBravado
    return true
  })
}
</script>

<style lang="scss" scoped></style>
