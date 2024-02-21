<template>
  <v-select
    class="select-thin rounded-lg"
    :hide-details="true"
    color="primary"
    variant="outlined"
    :persistent-placeholder="true"
    :items="items"
    item-value="value"
    item-title="text"
    :prefix="prefix ? `${prefix}: ` : ''"
    :model-value="modelValue"
    @update:model-value="v => emits('update:model-value', v)"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  prefix: string
  items: { value: string; text: string }[]
}>()

const emits = defineEmits<{
  (e: 'update:model-value', modelValue: string): void
}>()
</script>

<style lang="scss" scoped>
$padding-size: 2px;
.select-thin :deep(.v-field--no-label) {
  --v-input-padding-top: #{$padding-size};
  --v-field-padding-bottom: #{$padding-size} !important;
  --v-input-control-height: 1rem;

  .v-field__input {
    padding: 0;
    min-height: 28px;
  }
  .v-text-field__prefix {
    padding-top: 0;
    padding-bottom: 0;
    min-height: 28px;
  }
  .v-select__selection {
    margin-top: 0;
  }
}
</style>
