<template>
  <v-chip class="roice-chip overflow-visible" :color="color" variant="tonal" border v-bind="bindProps || {}">
    <div class="text-wrap text-caption d-flex flex-column">
      <span class="roice-name ellipsis mb-1">{{ roice.name }}</span>
      <span v-if="roice.damage < 4">{{ $t(`Nechronica.ROICE.${roice.id}.pos`) }}</span>
      <ruby v-else class="font-weight-normal" style="line-height: 1em">
        {{ $t(`Nechronica.ROICE.${roice.id}.neg`) }}
        <rt style="font-size: 8px">{{ $t(`Nechronica.ROICE.${roice.id}.pos`) }}</rt>
      </ruby>
    </div>
  </v-chip>
</template>

<script setup lang="ts">
import { NechronicaRoice } from '@/components/panes/Nechronica/nechronica'

defineProps<{
  roice: NechronicaRoice
  color: string
  bindProps?: any
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.roice-chip {
  height: 3em;
  min-width: 2.5rem;
  max-width: 4rem;
  box-sizing: content-box;
}
.roice-name {
  max-width: 4rem;
  box-sizing: content-box;
  overflow-y: hidden;
  line-height: 1em;
}
</style>
