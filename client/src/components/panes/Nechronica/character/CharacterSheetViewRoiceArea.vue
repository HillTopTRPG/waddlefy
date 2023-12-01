<template>
  <v-card-text class="d-flex flex-column align-stretch justify-center px-0 py-1">
    <v-sheet class="d-flex flex-row bg-transparent">
      <v-sheet class="d-flex flex-row flex-wrap align-end bg-transparent" style="width: 1em; flex-grow: 1; gap: 0.5rem">
        <template v-for="(roice, idx) in roiceList || []" :key="idx">
          <roice-badge
            :roice="roice"
            @update="updateRoice => onUpdateRoice(characterId, idx, updateRoice)"
            @delete="onDeleteRoice(characterId, idx)"
          />
        </template>
        <v-btn variant="tonal" rounded="xl" v-if="mode === 'edit'" class="" text="追加" @click="emits('add')" />
      </v-sheet>
    </v-sheet>
  </v-card-text>
</template>

<script setup lang="ts">
import { NechronicaRoice } from '@/components/panes/Nechronica/nechronica'
import RoiceBadge from '@/components/panes/Nechronica/roice/RoiceBadge.vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  characterId: string
  roiceList: NechronicaRoice[]
  mode: 'view' | 'edit'
}>()

const emits = defineEmits<{
  (e: 'update:roice', characterId: string, idx: number, roice: NechronicaRoice): void
  (e: 'delete', characterId: string, idx: number): void
  (e: 'add'): void
}>()

function onUpdateRoice(characterId: string, idx: number, roice: NechronicaRoice) {
  emits('update:roice', characterId, idx, roice)
}

function onDeleteRoice(characterId: string, idx: number) {
  emits('delete', characterId, idx)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
