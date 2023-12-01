<template>
  <v-card
    class="rounded-lg"
    :class="mode === 'view' ? '' : 'pb-2'"
    v-if="mode.startsWith('view')"
    style="outline-width: 3px; outline-offset: -3px; outline-style: solid"
    :style="`outline-color: ${NechronicaPowerList[maneuver.type].color}`"
  >
    <v-card-text class="px-2 pt-2 pb-0">
      <v-sheet class="d-flex flex-row flex-wrap mb-1" style="gap: 0.5rem">
        <v-defaults-provider :defaults="{ VChip: { size: 'small' } }">
          <v-chip class="font-weight-bold" color="error" variant="flat" v-if="maneuver.lost">損傷</v-chip>
          <v-chip class="font-weight-bold" color="secondary" variant="flat" v-if="maneuver.used">使用済</v-chip>
          <v-chip :class="`type${maneuver.type}`">{{
            NechronicaPowerList[maneuver.type]?.text || 'カテゴリなし'
          }}</v-chip>
          <v-chip variant="outlined" v-if="maneuver.shozoku">{{ maneuver.shozoku }}</v-chip>
        </v-defaults-provider>
        <v-spacer />
        <v-btn
          v-if="mode === 'view'"
          icon="mdi-pencil"
          density="comfortable"
          size="small"
          :flat="true"
          @click="emits('update:mode', 'edit')"
        />
      </v-sheet>
      <v-container class="pa-0" style="min-width: 20rem; max-width: 20rem">
        <v-defaults-provider :defaults="{ VCol: { class: 'overflow-hidden' } }">
          <v-row :no-gutters="true">
            <v-col class="v-col-12 text-no-wrap bg-grey-darken-3 font-weight-bold">
              <p class="text-h6 ellipsis" style="width: 77%; transform: scale(1.3, 1); transform-origin: left">
                【{{ maneuver.name }}】
              </p>
            </v-col>
          </v-row>
          <v-row :no-gutters="true">
            <v-defaults-provider :defaults="{ VCol: { class: 'py-2 text-no-wrap text-center text-body-1' } }">
              <v-col class="v-col-1 bg-grey-lighten-1 edging">T</v-col>
              <v-col class="v-col-3">{{ NechronicaTimingList[maneuver.timing].text }}</v-col>
              <v-col class="v-col-1 bg-grey-lighten-1 edging">C</v-col>
              <v-col class="v-col-3">{{ maneuver.cost }}</v-col>
              <v-col class="v-col-1 bg-grey-lighten-1 edging">R</v-col>
              <v-col class="v-col-3">{{ maneuver.range }}</v-col>
            </v-defaults-provider>
          </v-row>
          <v-row class="" :no-gutters="true" style="min-height: 5em">
            <v-col class="v-col-2 py-2 text-no-wrap text-center bg-grey-darken-3">効果</v-col>
            <v-col class="v-col-10 text-wrap pa-2">{{ maneuver.memo }}</v-col>
          </v-row>
        </v-defaults-provider>
      </v-container>
    </v-card-text>
    <v-card-text
      class="d-flex flex-wrap justify-start align-center px-2 pt-1 pb-2"
      style="gap: 0.5rem"
      v-if="mode === 'view'"
    >
      <maneuver-lost-btn :lost="maneuver.lost" @execute="onManeuverLost" />
      <heiki-btn
        :ignore-heiki="maneuver.ignoreHeiki"
        v-if="hasHeiki && maneuver.lost"
        @click="emits('update:ignoreHeiki', !maneuver.ignoreHeiki)"
      />
      <maneuver-use-btn :used="maneuver.used" :cost="maneuver.cost" @execute="onManeuverUse" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import HeikiBtn from '@/components/panes/Nechronica/component/HeikiBtn.vue'
import ManeuverLostBtn from '@/components/panes/Nechronica/maneuver/ManeuverLostBtn.vue'
import ManeuverUseBtn from '@/components/panes/Nechronica/maneuver/ManeuverUseBtn.vue'
import {
  NechronicaManeuver,
  NechronicaPowerList,
  NechronicaTimingList,
  NechronicaType
} from '@/components/panes/Nechronica/nechronica'

// eslint-disable-next-line unused-imports/no-unused-vars
defineProps<{
  maneuver: NechronicaManeuver
  type: NechronicaType
  hasHeiki: boolean
  mode: 'view' | 'view-simple' | 'edit'
}>()

const emits = defineEmits<{
  (e: 'update:used', value: boolean, cost: number): Promise<void>
  (e: 'update:lost', value: boolean): Promise<void>
  (e: 'update:mode', value: 'view' | 'edit'): Promise<void>
  (e: 'update:ignoreHeiki', value: boolean): Promise<void>
}>()

function onManeuverLost(lost: boolean) {
  emits('update:lost', lost)
}

function onManeuverUse(used: boolean, cost: number) {
  emits('update:used', used, cost)
}
</script>

<!--suppress HtmlUnknownAttribute -->
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