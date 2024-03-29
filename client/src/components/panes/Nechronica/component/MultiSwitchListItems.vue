<template>
  <v-list-subheader class="position-sticky" style="top: 1.5rem; z-index: 1">
    <v-sheet class="d-flex flex-row align-center bg-transparent">
      <span>{{ label }}</span>
      <v-switch-compact
        :label="$t('label.all')"
        :indeterminate="allStatus === 1"
        :model-value="allStatus === 2"
        @update:model-value="updateAll()"
      />
    </v-sheet>
  </v-list-subheader>
  <v-list-item class="py-0">
    <template v-for="select in selection" :key="select.value">
      <v-switch-compact
        :label="select.text"
        :value="select.value"
        :color="select.color"
        :model-value="modelValue"
        :i18n="i18n"
        @update:model-value="v => emits('update:model-value', v)"
      />
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import VSwitchCompact from '@/components/parts/VSwitchCompact.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  label: string
  modelValue: number[]
  texts: { text: string; color: string }[]
  i18n?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:model-value', values: number[]): void
}>()

watch(
  () => props.modelValue,
  v => {
    selected.value = v
  }
)

const selected = ref<number[]>(props.texts.map((_, idx) => idx))
watch(selected, v => {
  emits('update:model-value', v)
})

const allStatus = computed((): number => {
  if (!props.modelValue.length) return 0
  return props.modelValue.length === props.texts.length ? 2 : 1
})
function updateAll() {
  emits('update:model-value', allStatus.value < 2 ? props.texts.map((_, idx) => idx) : [])
}

const { t } = useI18n()

const selection = computed((): { value: number; text: string; color: string }[] => {
  return props.texts.map((text, idx) => ({ value: idx, text: text.text || t('label.empty'), color: text.color }))
})
</script>

<style lang="scss" scoped></style>
