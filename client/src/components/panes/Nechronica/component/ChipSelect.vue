<template>
  <v-chip
    :color="selections[modelValue].color"
    class="pa-0"
    density="default"
    style="line-height: 1.7em; min-height: 3em"
    variant="tonal"
  >
    <v-select
      class="chip-select"
      :color="selections[modelValue].color"
      :flat="true"
      :hide-details="true"
      density="compact"
      variant="solo-filled"
      :items="selections"
      item-value="value"
      item-title="text"
      :prefix="prefix ? `${prefix}: ` : ''"
      :model-value="modelValue"
      @update:model-value="v => emits('update:model-value', v)"
    >
      <template #item="{ item, props }">
        <v-list-item v-bind="props" :text="item.title" :subtitle="item.raw.subTitle"></v-list-item>
      </template>
      <template #selection="{ item }">
        <div class="d-flex flex-row align-baseline">
          <span style="font-size: 20px">{{ item.title }}</span>
          <span class="text-body-2" v-if="item.raw.subTitle">:{{ item.raw.subTitle }}</span>
        </div>
      </template>
    </v-select>
  </v-chip>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number
  prefix: string
  selections: { value: number; text: string; subTitle: string; color: string }[]
}>()

const emits = defineEmits<{
  (e: 'update:model-value', modelValue: number): void
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.chip-select {
  flex-grow: 0;

  :deep(.v-field) {
    padding: 0 8px;
  }
  :deep(.v-field__field) {
    display: flex;
    flex-direction: row;
    align-items: center;

    .v-field__input,
    .v-select__selection,
    .v-text-field__prefix,
    .v-text-field__prefix__text,
    .v-field__append-inner {
      margin: 0;
      padding: 0;
      font-size: 14px;
    }
  }
  :deep(.v-field__append-inner) .v-icon {
    margin: 0;
  }
}
</style>
