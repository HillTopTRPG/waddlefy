<template>
  <v-menu
    :close-on-content-click="false"
    :max-width="`${width}rem`"
    location="bottom left"
    scroll-strategy="close"
    style="box-sizing: content-box"
  >
    <template #activator="{ props }">
      <v-defaults-provider :defaults="{ VBadge: { location: 'bottom right', offsetX: 12 } }">
        <v-badge v-if="roice.damage < 3" :value="getValue()" :content="getValue()" :color="getColor()">
          <roice-chip :roice="roice" :color="roiceDamages[roice.damage].color" :bind-props="props" />
        </v-badge>
        <v-badge v-else-if="roice.damage === 3" :value="getValue()" :content="getValue()" :color="getColor()">
          <roice-chip :roice="roice" :color="roiceDamages[roice.damage].color" :bind-props="props" />
        </v-badge>
        <roice-chip v-else :roice="roice" :color="roiceDamages[roice.damage].color" :bind-props="props" />
      </v-defaults-provider>
    </template>
    <roice-card :roice="roice" @update="updateRoice => emits('update', updateRoice)" @delete="emits('delete')" />
  </v-menu>
</template>

<script setup lang="ts">
import { NechronicaRoice, roiceDamages } from '@/components/panes/Nechronica/nechronica'
import RoiceCard from '@/components/panes/Nechronica/roice/RoiceCard.vue'
import RoiceChip from '@/components/panes/Nechronica/roice/RoiceChip.vue'

const props = defineProps<{
  roice: NechronicaRoice
}>()

const emits = defineEmits<{
  (e: 'update', roice: NechronicaRoice): void
  (e: 'delete'): void
}>()

const width = 18

function getValue(): string {
  return roiceDamages[props.roice.damage].label
}

function getColor(): string {
  return roiceDamages[props.roice.damage].color
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
