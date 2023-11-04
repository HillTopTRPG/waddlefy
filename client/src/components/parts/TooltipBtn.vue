<template>
  <v-tooltip :class="tooltipClass">
    <template #activator="{ props }">
      <v-btn
        variant="text"
        :class="btnClass"
        v-bind="props"
        :stacked="stack || false"
        :size="btnSize as any"
        :icon="stack ? undefined : (btnIcon as any)"
        :prepend-icon="stack ? (btnIcon as any) : undefined"
        :text="btnText || ''"
        @click="emits('click')"
      />
    </template>
    {{ tooltipText }}
  </v-tooltip>
</template>

<script lang="ts" setup>
defineProps<{
  btnClass?: string
  stack?: boolean
  btnSize?: string
  btnIcon?: string
  btnText?: string
  tooltipClass?: string
  tooltipText: string
}>()

const emits = defineEmits<{
  (e: 'click'): void
}>()
</script>
