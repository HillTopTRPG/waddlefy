<template>
  <v-menu :close-on-content-click="false" scroll-strategy="close" location="bottom center" v-model="opened">
    <template #activator="{ props }">
      <maneuver-btn
        mode="normal"
        size="small"
        :type="type"
        :character="character"
        :maneuver="maneuver"
        :view-label="viewLabel"
        :battle-timing="battleTiming"
        :activate-props="props"
        :perspective="perspective"
      />
    </template>
    <maneuver-edit-card
      v-model:mode="mode"
      :maneuver="maneuver"
      :perspective="perspective"
      @update="v => emits('update', v)"
    />
    <maneuver-view-card
      v-model:mode="mode"
      :maneuver="maneuver"
      :has-bravado="hasBravado"
      :type="type"
      :perspective="perspective"
      @update:used="(v, cost) => emits('update:used', v, cost)"
      @update:lost="v => emits('update:lost', v)"
      @update:unknown="v => emits('update:unknown', v)"
      @update:ignore-bravado="v => emits('update:ignore-bravado', v)"
      @delete="emits('delete')"
    />
  </v-menu>
</template>

<script setup lang="ts">
import ManeuverBtn from '@/components/panes/Nechronica/maneuver/ManeuverBtn.vue'
import ManeuverEditCard from '@/components/panes/Nechronica/maneuver/ManeuverEditCard.vue'
import ManeuverViewCard from '@/components/panes/Nechronica/maneuver/ManeuverViewCard.vue'
import { Nechronica, NechronicaManeuver, NechronicaType } from '@/components/panes/Nechronica/nechronica'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  character: Nechronica
  maneuver: NechronicaManeuver
  type: NechronicaType
  viewLabel?: keyof NechronicaManeuver | ''
  battleTiming?: string
  perspective: string
}>()

const mode = ref<'view' | 'edit'>('view')

const emits = defineEmits<{
  (e: 'update:used', value: boolean, cost: number): Promise<void>
  (e: 'update:lost', value: boolean): Promise<void>
  (e: 'update:unknown', value: boolean): Promise<void>
  (e: 'update:ignore-bravado', value: boolean): Promise<void>
  (e: 'update', maneuver: NechronicaManeuver): Promise<void>
  (e: 'delete'): Promise<void>
}>()

const opened = ref(false)
watch(opened, v => {
  if (v) mode.value = 'view'
})

const hasBravado = computed(() => {
  return props.character.maneuverList.some(m => !m.isUnknown && !m.lost && m.isBravado)
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
