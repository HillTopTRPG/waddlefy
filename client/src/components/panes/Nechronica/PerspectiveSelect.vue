<template>
  <v-select
    v-if="isUserControl"
    prefix="視点:"
    variant="plain"
    :hide-details="true"
    class="menu-select"
    :items="perspectiveList"
    item-title="name"
    item-value="value"
    :model-value="modelValue"
    @update:model-value="v => emits('update:model-value', v)"
  >
    <template #prepend-inner>
      <v-icon icon="mdi-triangle-small-down" />
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)
const isUserControl = computed(() => Boolean(graphQlStore?.state.user?.token))

const perspectiveList = [
  { value: '', name: '主催者' },
  { value: 'player', name: '参加者' }
]

defineProps<{
  modelValue: string
}>()

const emits = defineEmits<{
  (e: 'update:model-value', modelValue: string): void
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.menu-select {
  flex-grow: 0;

  :deep(.v-field__append-inner) {
    display: none;
  }
  :deep(.v-field__prepend-inner) .v-icon {
    opacity: 1 !important;
    text-align: right;
    font-size: 18px;
    margin-top: 4px;
  }
  :deep(.v-field__prepend-inner),
  :deep(.v-text-field__prefix),
  :deep(.v-field__input) {
    padding-top: 0;
    padding-left: 0;
    margin-top: 2px;
    color: black;
    font-size: 14px;
    min-height: auto;
  }
}
</style>
