<template>
  <v-menu :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <nechronica-maneuver-btn :maneuver="maneuver" :view-label="viewLabel" :activate-props="props" />
    </template>
    <v-card>
      <v-card-title>{{ maneuver.name }}</v-card-title>
      <v-card-text class="py-1">カテゴリ：{{ NechronicaPowerList[maneuver.type]?.text || '' }}</v-card-text>
      <v-card-text class="py-1">タイミング：{{ NechronicaTimingList[maneuver.timing] }}</v-card-text>
      <v-card-text class="py-1">射程：{{ maneuver.range }}</v-card-text>
      <v-card-text class="py-1">コスト：{{ maneuver.cost }}</v-card-text>
      <v-card-text class="py-1">取得先：{{ maneuver.shozoku }}</v-card-text>
      <v-card-text class="py-1">効果：{{ maneuver.memo }}</v-card-text>
      <v-divider />
      <v-card-actions class="flex-wrap justify-start py-0">
        <v-defaults-provider
          :defaults="{ VCheckbox: { density: 'comfortable', hideDetails: true, class: 'flex-grow-0' } }"
        >
          <v-checkbox color="error" :model-value="maneuver.lost" @update:model-value="v => emits('update:lost', v)">
            <template v-slot:label>
              <span class="text-no-wrap">損傷</span>
            </template>
          </v-checkbox>
          <v-checkbox color="primary" :model-value="maneuver.used" @update:model-value="v => emits('update:used', v)">
            <template v-slot:label>
              <span class="text-no-wrap">使用</span>
            </template>
          </v-checkbox>
        </v-defaults-provider>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import {
  Nechronica,
  NechronicaManeuver,
  NechronicaPowerList,
  NechronicaTimingList
} from '@/components/panes/Nechronica/nechronica'
import NechronicaManeuverBtn from '@/components/panes/Nechronica/NechronicaManeuverBtn.vue'

// eslint-disable-next-line unused-imports/no-unused-vars
defineProps<{
  character: Nechronica
  maneuver: NechronicaManeuver
  viewLabel?: keyof NechronicaManeuver | ''
}>()

const emits = defineEmits<{
  (e: 'update:used', value: boolean): Promise<void>
  (e: 'update:lost', value: boolean): Promise<void>
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
