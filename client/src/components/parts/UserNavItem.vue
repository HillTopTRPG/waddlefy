<script setup lang='ts'>
import { computed } from 'vue'

const props = defineProps<{
  label: string
  tooltipText: string
  appendIcon?: string
  prependIcon?: string
  value: string
  showLabel: boolean
  listItemStyle?: string
  bigIcon?: boolean
}>()

const emits = defineEmits<{
  (e: 'select', value: string): void
}>()

const iconSize  = computed(() => props.bigIcon ? 'default' : 'small')
const iconClass = computed(() => props.bigIcon ? 'ma-2' : 'mr-6')
</script>

<template>
  <v-tooltip transition='scale-transition'>
    <template #activator='{ props }'>
      <v-list-item
        variant='flat'
        color='primary'
        :value='value || undefined'
        v-bind='props'
        class="ml-2 pl-3"
        style="border-radius: 10px 0 0 10px;"
        :style='listItemStyle'
        @click='emits("select", value)'
        @keydown.enter.stop='$event.target.click()'
      >
        <template #append>
          <v-icon :size='iconSize' :class='iconClass' v-if='appendIcon'>mdi-{{ appendIcon }}</v-icon>
        </template>
        <template #prepend>
          <v-icon :size='iconSize' :class='iconClass' v-if='prependIcon'>mdi-{{ prependIcon }}</v-icon>
        </template>
        <transition name='fade' :class="{'d-none' : !showLabel}">
          <v-list-item-title v-if='showLabel'>{{ label }}</v-list-item-title>
        </transition>
      </v-list-item>
    </template>
    <span class='font-weight-bold'>{{ tooltipText }}</span>
  </v-tooltip>
</template>

<!--suppress CssUnusedSymbol, HtmlUnknownAttribute -->
<style deep lang='css'>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
