<template>
  <v-menu :close-on-content-click="false" scroll-strategy="close" location="bottom center" v-model="opened">
    <template #activator="{ props }">
      <maneuver-btn
        mode="normal"
        size="small"
        :maneuver="maneuver"
        :view-label="viewLabel"
        :battle-timing="battleTiming"
        :activate-props="props"
      />
    </template>
    <maneuver-edit-card v-model:mode="mode" :maneuver="maneuver" @update="v => emits('update', v)" />
    <maneuver-view-card
      v-model:mode="mode"
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
import ManeuverBtn from '@/components/panes/Nechronica/maneuver/ManeuverBtn.vue'
import ManeuverEditCard from '@/components/panes/Nechronica/maneuver/ManeuverEditCard.vue'
import ManeuverViewCard from '@/components/panes/Nechronica/maneuver/ManeuverViewCard.vue'
import { Nechronica, NechronicaManeuver, NechronicaType } from '@/components/panes/Nechronica/nechronica'
import { computed, ref, watch } from 'vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  character: Nechronica
  maneuver: NechronicaManeuver
  type: NechronicaType
  viewLabel?: keyof NechronicaManeuver | ''
  battleTiming?: string
}>()

const mode = ref<'view' | 'edit'>('view')

const emits = defineEmits<{
  (e: 'update:used', value: boolean, cost: number): Promise<void>
  (e: 'update:lost', value: boolean): Promise<void>
  (e: 'update:ignore-heiki', value: boolean): Promise<void>
  (e: 'update', maneuver: NechronicaManeuver): Promise<void>
}>()

const opened = ref(false)
watch(opened, v => {
  if (v) mode.value = 'view'
})

const hasHeiki = computed(() => {
  return props.character.maneuverList.some(m => m.isHeiki)
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>