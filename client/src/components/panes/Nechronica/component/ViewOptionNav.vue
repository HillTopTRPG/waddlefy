<template>
  <v-navigation-drawer
    location="right"
    :model-value="nav"
    @update:model-value="v => emits('update:nav', v)"
    width="250"
    :scrim="false"
    :disable-resize-watcher="true"
  >
    <v-list class="h-100 py-0" style="contain: paint; overflow: scroll">
      <v-defaults-provider
        :defaults="{ VListSubheader: { class: 'bg-amber-lighten-4', style: 'height: 1.5rem; min-height:1.5rem' } }"
      >
        <v-list-item-title class="position-sticky bg-amber-lighten-1 pl-2" style="top: 0; z-index: 2">{{
          $t('Nechronica.label.roice')
        }}</v-list-item-title>
        <v-list-item class="py-1">
          <v-defaults-provider :defaults="{ VRadioGroup: { density: 'compact', hideDetails: true } }">
            <v-radio-group
              class="flex-grow-0 mr-2"
              :model-value="option.roicePosition"
              @update:model-value="v => updateRoicePosition(v || 'none')"
            >
              <template v-for="select in mapping.ROICE_VIEW_POSITION" :key="select.value">
                <v-radio :value="select.value">
                  <template #label>
                    <span class="text-body-1 font-weight-bold">{{ $t(select.label) }}</span>
                  </template>
                </v-radio>
              </template>
            </v-radio-group>
          </v-defaults-provider>
        </v-list-item>
        <v-list-item-title class="position-sticky bg-amber-lighten-1 pl-2" style="top: 0; z-index: 2">{{
          $t('Nechronica.label.maneuver')
        }}</v-list-item-title>
        <v-sheet>
          <v-list-subheader class="position-sticky" style="top: 1.5rem; z-index: 1">{{
            $t('Nechronica.label.under-label')
          }}</v-list-subheader>
          <v-list-item class="py-1">
            <v-defaults-provider :defaults="{ VRadioGroup: { density: 'compact', hideDetails: true } }">
              <v-radio-group
                class="flex-grow-0 mr-2"
                :model-value="option.viewLabel"
                @update:model-value="v => updateViewLabel(v || '')"
              >
                <template v-for="select in mapping.MANEUVER_UNDER_TEXT" :key="select.value">
                  <v-radio :value="select.value">
                    <template #label>
                      <span class="text-body-1 font-weight-bold">{{ $t(select.label) }}</span>
                    </template>
                  </v-radio>
                </template>
              </v-radio-group>
            </v-defaults-provider>
          </v-list-item>
        </v-sheet>
        <v-sheet>
          <multi-switch-list-items
            :label="$t('Nechronica.label.view-timing')"
            :texts="mapping.MANEUVER_TIMING"
            :model-value="option.selectedTimings"
            :i18n="true"
            @update:model-value="updateSelectedTimings"
          />
        </v-sheet>
        <v-sheet>
          <v-list-subheader class="position-sticky" style="top: 1.5rem; z-index: 1">{{
            $t('Nechronica.label.status')
          }}</v-list-subheader>
          <v-list-item class="py-1">
            <v-switch-compact
              :label="$t('Nechronica.label.lost')"
              color="error"
              :model-value="option.viewLost"
              @update:model-value="v => updateViewLost(v)"
            />
            <v-switch-compact
              :label="$t('Nechronica.label.used')"
              :model-value="option.viewUsed"
              @update:model-value="v => updateViewUsed(v)"
            />
            <v-switch-compact
              :label="$t('Nechronica.label.unknown')"
              :model-value="option.viewUnknown"
              @update:model-value="v => updateViewUnknown(v)"
            />
            <v-divider />
            <v-switch-compact
              :label="$t('Nechronica.label.only-added')"
              :model-value="option.viewOnlyAdded"
              @update:model-value="v => updateViewOnlyAdded(v)"
            />
            <v-switch-compact
              :label="$t('Nechronica.label.only-is-bravado')"
              :model-value="option.viewOnlyIsBravado"
              @update:model-value="v => updateViewOnlyIsBravado(v)"
            />
            <v-switch-compact
              :label="$t('Nechronica.label.only-bravado-target')"
              :model-value="option.viewOnlyBravadoTarget"
              @update:model-value="v => updateViewOnlyBravadoTarget(v)"
            />
            <v-switch-compact
              :label="$t('Nechronica.label.only-ignore-bravado')"
              :model-value="option.viewOnlyIgnoreBravado"
              @update:model-value="v => updateViewOnlyIgnoreBravado(v)"
            />
          </v-list-item>
        </v-sheet>
        <v-sheet>
          <multi-switch-list-items
            :label="$t('Nechronica.label.view-category')"
            :texts="mapping.MANEUVER_TYPE"
            :model-value="option.selectedTypes"
            :i18n="true"
            @update:model-value="updateSelectedTypes"
          />
        </v-sheet>
      </v-defaults-provider>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import MultiSwitchListItems from '@/components/panes/Nechronica/component/MultiSwitchListItems.vue'
import mapping from '@/components/panes/Nechronica/mapping.json'
import { clone } from '@/components/panes/PrimaryDataUtility'
import VSwitchCompact from '@/components/parts/VSwitchCompact.vue'

export type NechronicaViewOption = {
  roicePosition: 'before' | 'after' | 'none'
  viewLabel: '' | 'timing' | 'cost' | 'range'
  viewLost: boolean
  viewUsed: boolean
  viewUnknown: boolean
  viewOnlyAdded: boolean
  viewOnlyIsBravado: boolean
  viewOnlyBravadoTarget: boolean
  viewOnlyIgnoreBravado: boolean
  selectedTimings: number[]
  selectedTypes: number[]
}

const props = defineProps<{
  nav: boolean
  option: NechronicaViewOption
}>()

const emits = defineEmits<{
  (e: 'update:option', modelValue: NechronicaViewOption): void
  (e: 'update:nav', nav: boolean): void
}>()

function updateOptionHelper(callback: (option: NechronicaViewOption) => void) {
  const opt = clone(props.option)!
  callback(opt)
  if (JSON.stringify(props.option) === JSON.stringify(opt)) return
  emits('update:option', opt)
}

function updateViewLabel(v: NechronicaViewOption['viewLabel']) {
  updateOptionHelper(opt => (opt.viewLabel = v))
}

function updateRoicePosition(v: NechronicaViewOption['roicePosition']) {
  updateOptionHelper(opt => (opt.roicePosition = v))
}

function updateViewLost(v: boolean) {
  updateOptionHelper(opt => (opt.viewLost = v))
}

function updateViewUsed(v: boolean) {
  updateOptionHelper(opt => (opt.viewUsed = v))
}

function updateViewUnknown(v: boolean) {
  updateOptionHelper(opt => (opt.viewUnknown = v))
}

function updateViewOnlyAdded(v: boolean) {
  updateOptionHelper(opt => {
    opt.viewOnlyAdded = v
    if (v) {
      opt.viewOnlyIsBravado = false
      opt.viewOnlyBravadoTarget = false
      opt.viewOnlyIgnoreBravado = false
    }
  })
}

function updateViewOnlyIsBravado(v: boolean) {
  updateOptionHelper(opt => {
    opt.viewOnlyIsBravado = v
    if (v) {
      opt.viewOnlyAdded = false
      opt.viewOnlyBravadoTarget = false
      opt.viewOnlyIgnoreBravado = false
    }
  })
}

function updateViewOnlyBravadoTarget(v: boolean) {
  updateOptionHelper(opt => {
    opt.viewOnlyBravadoTarget = v
    if (v) {
      opt.viewOnlyAdded = false
      opt.viewOnlyIsBravado = false
      opt.viewOnlyIgnoreBravado = false
    }
  })
}

function updateViewOnlyIgnoreBravado(v: boolean) {
  updateOptionHelper(opt => {
    opt.viewOnlyIgnoreBravado = v
    if (v) {
      opt.viewOnlyAdded = false
      opt.viewOnlyIsBravado = false
      opt.viewOnlyBravadoTarget = false
    }
  })
}

function updateSelectedTypes(v: number[]) {
  updateOptionHelper(opt => (opt.selectedTypes = v))
}

function updateSelectedTimings(v: number[]) {
  updateOptionHelper(opt => (opt.selectedTimings = v))
}
</script>

<style lang="scss" scoped></style>
