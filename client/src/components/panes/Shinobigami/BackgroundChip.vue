kground
<template>
  <v-menu :open-on-click="true" location="bottom center" :z-index="10000000">
    <template v-slot:activator="{ props }">
      <v-chip
        :color="color"
        :prepend-icon="icon"
        :label="true"
        :border="true"
        :elevation="3"
        variant="flat"
        size="small"
        v-bind="props"
        >{{ text }}{{ usePoint ? `(${usePoint})` : '' }}</v-chip
      >
    </template>
    <div class="mt-2 border pa-2 rounded text-body-2" :class="chipClass">
      <p class="overflow-auto" style="white-space: pre; font-size: 0.8em !important">
        {{ chip }}
      </p>
    </div>
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
