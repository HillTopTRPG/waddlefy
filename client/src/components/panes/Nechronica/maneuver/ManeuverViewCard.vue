<template>
  <v-card
    class="rounded-lg d-flex flex-column align-stretch"
    :class="mode === 'view' ? '' : 'pb-2'"
    v-if="mode !== 'edit'"
    style="outline-width: 3px; outline-offset: -3px; outline-style: solid"
    :style="perspective && maneuver.isUnknown ? '' : `outline-color: ${mapping.MANEUVER_TYPE[maneuver.type].color}`"
  >
    <v-card-text class="px-2 pt-2 pb-0">
      <v-sheet class="d-flex flex-row flex-wrap mb-1" style="gap: 0.5rem">
        <v-chip
          class="font-weight-bold"
          size="small"
          color="error"
          variant="flat"
          v-if="maneuver.lost"
          :text="$t('Nechronica.label.lost')"
        />
        <v-chip
          class="font-weight-bold"
          size="small"
          color="secondary"
          variant="flat"
          v-if="maneuver.used"
          :text="$t('Nechronica.label.used')"
        />
        <v-chip
          v-if="!perspective || !maneuver.isUnknown"
          :class="`type${maneuver.type}`"
          size="small"
          :text="$t(mapping.MANEUVER_TYPE[maneuver.type]?.text || 'Nechronica.MANEUVER_TYPE.none')"
        />
        <v-chip
          size="small"
          variant="outlined"
          v-if="maneuver.shozoku && (!perspective || !maneuver.isUnknown)"
          :text="maneuver.shozoku"
        />
        <v-spacer />
        <delete-menu-btn
          v-if="!perspective && maneuver.isAdded && mode === 'view'"
          :target-name="maneuver.name"
          :type="$t('Nechronica.label.maneuver')"
          :no-text="true"
          @execute="onDeleteManeuver()"
        />
        <v-btn
          v-if="mode === 'view' && (type === 'doll' || !perspective)"
          icon="mdi-pencil"
          density="comfortable"
          size="small"
          :flat="true"
          @click="emits('update:mode', 'edit')"
        />
      </v-sheet>
      <v-container class="pa-0" style="min-width: 20rem; max-width: 20rem">
        <v-row :no-gutters="true">
          <v-col class="v-col-12 text-no-wrap bg-grey-darken-3 font-weight-bold overflow-hidden">
            <p class="text-h6 ellipsis" style="width: 77%; transform: scale(1.3, 1); transform-origin: left">
              【{{ wrapUnknown(maneuver.name) }}】
            </p>
          </v-col>
        </v-row>
        <v-row :no-gutters="true">
          <v-col :class="maneuverSpecTitleClasses">T</v-col>
          <v-col :class="maneuverSpecContentClasses">{{
            wrapUnknown($t(mapping.MANEUVER_TIMING[maneuver.timing].text))
          }}</v-col>
          <v-col :class="maneuverSpecTitleClasses">C</v-col>
          <v-col :class="maneuverSpecContentClasses">
            <span v-if="perspective && maneuver.isUnknown">???</span>
            <span v-else-if="overCostWrap === undefined">{{ costWrap }}</span>
            <template v-else>
              <span class="text-decoration-line-through text-body-2" style="line-height: 1em">{{ costWrap }}</span>
              <span class="text-body-1" style="line-height: 1em">{{ overCostWrap }}</span>
            </template>
          </v-col>
          <v-col :class="maneuverSpecTitleClasses">R</v-col>
          <v-col :class="maneuverSpecContentClasses">{{ wrapUnknown(maneuver.range) }}</v-col>
        </v-row>
        <v-row class="" :no-gutters="true" style="min-height: 5em">
          <v-col class="v-col-2 py-2 text-no-wrap text-center overflow-hidden bg-grey-darken-3">{{
            $t('Nechronica.label.effect')
          }}</v-col>
          <v-col class="v-col-10 text-wrap pa-2 overflow-hidden">{{ wrapUnknown(maneuver.memo) }}</v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-text
      class="d-flex flex-wrap flex-row mx-2 mt-1 mb-2 pa-0"
      style="max-width: 20rem; gap: 0.5rem"
      v-if="mode === 'view'"
    >
      <maneuver-lost-btn v-if="type !== 'legion'" :lost="maneuver.lost" @execute="onManeuverLost" />
      <bravado-btn
        :ignore-bravado="maneuver.ignoreBravado"
        v-if="hasBravado && maneuver.lost"
        @click="emits('update:ignoreBravado', !maneuver.ignoreBravado)"
      />
      <maneuver-use-btn
        v-if="!maneuver.isUnknown"
        :used="maneuver.used"
        :cost="maneuver.cost"
        @execute="onManeuverUse"
      />
      <maneuver-unknown-btn
        v-if="!perspective && maneuver.isAdded"
        :is-unknown="maneuver.isUnknown"
        @execute="onManeuverUnknown"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import DeleteMenuBtn from '@/components/DeleteMenuBtn.vue'
import BravadoBtn from '@/components/panes/Nechronica/component/BravadoBtn.vue'
import ManeuverLostBtn from '@/components/panes/Nechronica/maneuver/ManeuverLostBtn.vue'
import ManeuverUnknownBtn from '@/components/panes/Nechronica/maneuver/ManeuverUnknownBtn.vue'
import ManeuverUseBtn from '@/components/panes/Nechronica/maneuver/ManeuverUseBtn.vue'
import mapping from '@/components/panes/Nechronica/mapping.json'
import {
  getActionValueNum,
  NechronicaManeuver,
  NechronicaManeuverStackType,
  NechronicaType
} from '@/components/panes/Nechronica/nechronica'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  maneuver: NechronicaManeuver
  type: NechronicaType
  historyType?: NechronicaManeuverStackType
  overCost?: number | undefined
  hasBravado: boolean
  mode: 'view' | 'history-stack' | 'edit'
  perspective: string
}>()

const emits = defineEmits<{
  (e: 'update:used', value: boolean, cost: number): Promise<void>
  (e: 'update:lost', value: boolean): Promise<void>
  (e: 'update:unknown', value: boolean): Promise<void>
  (e: 'update:mode', value: 'view' | 'edit'): Promise<void>
  (e: 'update:ignoreBravado', value: boolean): Promise<void>
  (e: 'delete'): Promise<void>
}>()

const maneuverSpecClasses = ['text-center', 'text-body-2', 'd-flex', 'flex-column', 'ellipsis', 'py-2']
const maneuverSpecTitleClasses = [...maneuverSpecClasses, 'v-col-1', 'justify-center', 'bg-grey-lighten-1', 'edging']
const maneuverSpecContentClasses = [...maneuverSpecClasses, 'v-col-3', 'justify-space-around']

const { t } = useI18n()

const costWrap = computed(() => {
  if (overCostWrap.value !== undefined && props.maneuver.cost === '') return t('label.none')
  return props.maneuver.cost
})

const overCostWrap = computed((): number | undefined => {
  if (props.historyType !== 'use' || props.overCost === undefined) return undefined
  const cost = getActionValueNum(props.maneuver.cost)
  return cost === props.overCost ? undefined : props.overCost
})

function onManeuverLost(lost: boolean) {
  emits('update:lost', lost)
}

function onManeuverUse(used: boolean, cost: number) {
  emits('update:used', used, cost)
}

function onManeuverUnknown(isUnknown: boolean) {
  emits('update:unknown', isUnknown)
}

function wrapUnknown(text: string) {
  if (!props.maneuver.isUnknown) return text
  if (!props.perspective) return text
  return '???'
}

function onDeleteManeuver() {
  emits('delete')
}
</script>

<style lang="scss" scoped>
.edging {
  color: white !important;
  text-shadow:
    1px 1px 0 black,
    -1px -1px 0 black,
    -1px 1px 0 black,
    1px -1px 0 black,
    0px 1px 0 black,
    0-1px 0 black,
    -1px 0 0 black,
    1px 0 0 black;
}

.v-chip.type1 {
  border: 2px solid rgb(0, 128, 1);
}

.v-chip.type2 {
  border: 2px solid rgb(139, 0, 0);
}

.v-chip.type3 {
  border: 2px solid rgb(217, 150, 38);
}

.v-chip.type4 {
  border: 2px solid rgb(128, 128, 255);
}

.v-chip.type5 {
  border: 2px solid rgb(255, 128, 128);
}

.v-chip.type6 {
  border: 2px solid rgb(191, 128, 255);
}

.v-chip.type7 {
  border: 2px solid rgb(223, 223, 128);
}
</style>
