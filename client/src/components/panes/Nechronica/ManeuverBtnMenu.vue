<template>
  <v-menu :close-on-content-click="false" scroll-strategy="close" location="bottom center">
    <template #activator="{ props }">
      <v-badge
        :model-value="mode === 'edit'"
        color="red"
        text-color="red"
        :floating="true"
        location="bottom right"
        offset-x="6"
        offset-y="6"
        :dot="true"
        rounded="xl"
      >
        <maneuver-btn mode="normal" size="small" :maneuver="maneuver" :view-label="viewLabel" :activate-props="props" />
      </v-badge>
    </template>
    <maneuver-edit-card v-if="mode === 'edit'" :maneuver="maneuver" @update="v => emits('update', v)" />
    <maneuver-view-card
      v-else
      :maneuver="maneuver"
      :has-heiki="hasHeiki"
      :type="type"
      @update:used="(v, cost) => emits('update:used', v, cost)"
      @update:lost="v => emits('update:lost', v)"
      @update:ignore-heiki="v => emits('update:ignore-heiki', v)"
    />
  </v-menu>
</template>

<script setup lang="ts">
import ManeuverBtn from '@/components/panes/Nechronica/ManeuverBtn.vue'
import ManeuverEditCard from '@/components/panes/Nechronica/ManeuverEditCard.vue'
import ManeuverViewCard from '@/components/panes/Nechronica/ManeuverViewCard.vue'
import { Nechronica, NechronicaManeuver, NechronicaType } from '@/components/panes/Nechronica/nechronica'
import { computed } from 'vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  character: Nechronica
  maneuver: NechronicaManeuver
  type: NechronicaType
  mode: 'view' | 'edit'
  viewLabel?: keyof NechronicaManeuver | ''
}>()

const emits = defineEmits<{
  (e: 'update:used', value: boolean, cost: number): Promise<void>
  (e: 'update:lost', value: boolean): Promise<void>
  (e: 'update:ignore-heiki', value: boolean): Promise<void>
  (e: 'update', maneuver: NechronicaManeuver): Promise<void>
}>()

const hasHeiki = computed(() => {
  return props.character.maneuverList.some(m => m.name.includes('平気'))
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
