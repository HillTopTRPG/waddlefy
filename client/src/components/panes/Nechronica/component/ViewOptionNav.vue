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
        <v-sheet>
          <multi-switch-list-items
            :label="$t('Nechronica.label.view-timing')"
            :texts="mapping.MANEUVER_TIMING"
            :model-value="option.selectedTimings"
            :i18n="true"
            @update:model-value="updateSelectedTimings"
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
import {watch} from 'vue'

export type NechronicaViewOption = {
  roicePosition: 'before' | 'after' | 'none'
  viewLabel: '' | 'timing' | 'cost' | 'range'
  viewLost: boolean
  viewUsed: boolean
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

function updateSelectedTypes(v: number[]) {
  updateOptionHelper(opt => (opt.selectedTypes = v))
}

function updateSelectedTimings(v: number[]) {
  updateOptionHelper(opt => (opt.selectedTimings = v))
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
