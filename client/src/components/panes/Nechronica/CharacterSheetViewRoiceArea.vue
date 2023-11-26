<template>
  <v-card-text class="d-flex flex-column align-stretch justify-center px-0 py-1">
    <v-sheet class="d-flex flex-row pb-2">
      <v-sheet class="d-flex flex-row flex-wrap" style="width: 1em; flex-grow: 1; gap: 0.5rem">
        <template v-for="(roice, idx) in roiceList || []" :key="idx">
          <roice-badge :roice="roice" @update="updateRoice => onUpdateRoice(characterId, idx, updateRoice)" />
        </template>
      </v-sheet>
    </v-sheet>
  </v-card-text>
</template>

<script setup lang="ts">
import { NechronicaRoice } from '@/components/panes/Nechronica/nechronica'
import RoiceBadge from '@/components/panes/Nechronica/RoiceBadge.vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  characterId: string
  roiceList: NechronicaRoice[]
}>()

const emits = defineEmits<{
  (e: 'update:roice', characterId: string, idx: number, roice: NechronicaRoice): void
}>()

function onUpdateRoice(characterId: string, idx: number, roice: NechronicaRoice) {
  emits('update:roice', characterId, idx, roice)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
