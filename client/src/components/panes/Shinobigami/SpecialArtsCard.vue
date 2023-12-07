<template>
  <v-card class="border special-arts-card" style="max-width: 20rem">
    <v-card-title class="text-pre-wrap">{{ arts.name }}</v-card-title>
    <v-card-text class="pb-2">
      <v-label class="text-caption">指定特技</v-label>
      <v-sheet class="text-pre-wrap text-body-2 bg-transparent">{{ arts.skill }}</v-sheet>
    </v-card-text>
    <v-card-text class="pt-0 pb-2">
      <v-label class="text-caption">効果／強み／弱み</v-label>
      <v-sheet class="text-pre-wrap text-body-2 bg-transparent">{{ arts.effect || '(未記入)' }}</v-sheet>
    </v-card-text>
    <v-card-text class="pt-0">
      <v-label class="text-caption">演出</v-label>
      <v-sheet class="text-pre-wrap text-body-2 bg-transparent">{{ arts.direction || '(未記入)' }}</v-sheet>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { SpecialArts } from '@/components/panes/Shinobigami/shinobigami'

defineProps<{
  arts: SpecialArts
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.special-arts-card {
  background-image: url('/white_00053.jpg') !important;

  &:before {
    content: '';
    z-index: -1;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    backdrop-filter: blur(1px);
  }
}
</style>
