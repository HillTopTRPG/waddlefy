<template>
  <v-menu :open-on-click="true" location="bottom left" :z-index="10000000">
    <template v-slot:activator="{ props }">
      <v-chip :color="color" :label="true" :border="true" :elevation="3" variant="flat" size="small" v-bind="props">
        <v-icon :icon="icon" class="mr-1" />
        <span>{{ text }}{{ usePoint ? `(${usePoint})` : '' }}</span>
      </v-chip>
    </template>
    <v-card class="border" :class="chipClass" style="max-width: 20rem">
      <v-card-title class="text-pre-wrap">{{ text }}</v-card-title>
      <v-card-text class="pb-2">
        <v-sheet class="text-pre-wrap text-body-2 bg-transparent">{{ chip }}</v-sheet>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text: string
  chip: string
  point: string
  type: string
}>()

const usePoint = computed(() => (isNaN(props.point) ? 0 : Number(props.point)))

function typeValue(strong: string, weak: string): string {
  if (props.type === '長所') return strong
  if (props.type === '弱点') return weak
  return ''
}

const color = typeValue('orange', 'cyan')
const icon = typeValue('mdi-arrow-up-right-bold', 'mdi-arrow-down-left-bold')
const chipClass = typeValue('bg-orange-lighten-5', 'bg-cyan-lighten-5')
</script>
