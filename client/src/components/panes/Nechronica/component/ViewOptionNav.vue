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
        <v-list-item-title class="position-sticky bg-amber-lighten-1 pl-2" style="top: 0; z-index: 2">
          未練
        </v-list-item-title>
        <v-list-item class="py-1">
          <v-defaults-provider :defaults="{ VRadioGroup: { density: 'compact', hideDetails: true } }">
            <v-radio-group
              class="flex-grow-0 mr-2"
              :model-value="option.roicePosition"
              @update:model-value="v => updateRoicePosition(v)"
            >
              <template v-for="select in roicePositionSelections" :key="select.value">
                <v-radio :value="select.value">
                  <template #label>
                    <span class="text-body-1 font-weight-bold">{{ select.label }}</span>
                  </template>
                </v-radio>
              </template>
            </v-radio-group>
          </v-defaults-provider>
        </v-list-item>
        <v-list-item-title class="position-sticky bg-amber-lighten-1 pl-2" style="top: 0; z-index: 2"
          >マニューバ</v-list-item-title
        >
        <v-sheet>
          <v-list-subheader class="position-sticky" style="top: 1.5rem; z-index: 1">下部ラベル</v-list-subheader>
          <v-list-item class="py-1">
            <v-defaults-provider :defaults="{ VRadioGroup: { density: 'compact', hideDetails: true } }">
              <v-radio-group
                class="flex-grow-0 mr-2"
                :model-value="option.viewLabel"
                @update:model-value="v => updateViewLabel(v)"
              >
                <template v-for="select in viewLabelSelections" :key="select.value">
                  <v-radio :value="select.value">
                    <template #label>
                      <span class="text-body-1 font-weight-bold">{{ select.label }}</span>
                    </template>
                  </v-radio>
                </template>
              </v-radio-group>
            </v-defaults-provider>
          </v-list-item>
        </v-sheet>
        <v-sheet>
          <v-list-subheader class="position-sticky" style="top: 1.5rem; z-index: 1">状態</v-list-subheader>
          <v-list-item class="py-1">
            <v-switch-compact
              label="損傷"
              color="error"
              :model-value="option.viewLost"
              @update:model-value="v => updateViewLost(v)"
            />
            <v-switch-compact
              label="使用済"
              :model-value="option.viewUsed"
              @update:model-value="v => updateViewUsed(v)"
            />
          </v-list-item>
        </v-sheet>
        <v-sheet>
          <multi-switch-list-items
            label="表示カテゴリ"
            :texts="NechronicaPowerList"
            :model-value="option.selectedTypes"
            @update:model-value="updateSelectedTypes"
          />
        </v-sheet>
        <v-sheet>
          <multi-switch-list-items
            label="表示タイミング"
            :texts="NechronicaTimingList"
            :model-value="option.selectedTimings"
            @update:model-value="updateSelectedTimings"
          />
        </v-sheet>
      </v-defaults-provider>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import MultiSwitchListItems from '@/components/panes/Nechronica/component/MultiSwitchListItems.vue'
import { NechronicaPowerList, NechronicaTimingList } from '@/components/panes/Nechronica/nechronica'
import { clone } from '@/components/panes/PrimaryDataUtility'
import VSwitchCompact from '@/components/parts/VSwitchCompact.vue'

export type NechronicaViewOption = {
  roicePosition: 'before' | 'after' | 'none'
  viewLabel: '' | 'timing' | 'cost' | 'range'
  viewLost: boolean
  viewUsed: boolean
  selectedTimings: number[]
  selectedTypes: number[]
}

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  nav: boolean
  option: NechronicaViewOption
}>()

// eslint-disable-next-line unused-imports/no-unused-vars
const emits = defineEmits<{
  (e: 'update:option', modelValue: NechronicaViewOption): void
  (e: 'update:nav', nav: boolean): void
}>()

const roicePositionSelections = [
  { value: 'before', label: 'マニューバの上' },
  { value: 'after', label: 'マニューバの下' },
  { value: 'none', label: '表示しない' }
]

const viewLabelSelections = [
  { value: '', label: 'なし' },
  { value: 'timing', label: 'タイミング' },
  { value: 'cost', label: 'コスト' },
  { value: 'range', label: '射程' }
]

function updateViewLabel(v: NechronicaViewOption['viewLabel']) {
  const opt = clone(props.option)!
  opt.viewLabel = v
  emits('update:option', opt)
}

function updateRoicePosition(v: NechronicaViewOption['roicePosition']) {
  const opt = clone(props.option)!
  opt.roicePosition = v
  emits('update:option', opt)
}

function updateViewLost(v: boolean) {
  const opt = clone(props.option)!
  opt.viewLost = v
  emits('update:option', opt)
}

function updateViewUsed(v: boolean) {
  const opt = clone(props.option)!
  opt.viewUsed = v
  emits('update:option', opt)
}

function updateSelectedTypes(v: number[]) {
  const opt = clone(props.option)!
  opt.selectedTypes = v
  emits('update:option', opt)
}

function updateSelectedTimings(v: number[]) {
  const opt = clone(props.option)!
  opt.selectedTimings = v
  emits('update:option', opt)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>