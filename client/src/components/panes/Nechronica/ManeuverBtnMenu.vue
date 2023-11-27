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
      :type="type"
      @update:used="v => emits('update:used', v)"
      @update:lost="v => emits('update:lost', v)"
    />
  </v-menu>
</template>

<script setup lang="ts">
import ManeuverBtn from '@/components/panes/Nechronica/ManeuverBtn.vue'
import ManeuverEditCard from '@/components/panes/Nechronica/ManeuverEditCard.vue'
import ManeuverViewCard from '@/components/panes/Nechronica/ManeuverViewCard.vue'
import { Nechronica, NechronicaManeuver, NechronicaType } from '@/components/panes/Nechronica/nechronica'

// eslint-disable-next-line unused-imports/no-unused-vars
defineProps<{
  character: Nechronica
  maneuver: NechronicaManeuver
  type: NechronicaType
  mode: 'view' | 'edit'
  viewLabel?: keyof NechronicaManeuver | ''
}>()

const emits = defineEmits<{
  (e: 'update:used', value: boolean): Promise<void>
  (e: 'update:lost', value: boolean): Promise<void>
  (e: 'update', maneuver: NechronicaManeuver): Promise<void>
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
