<template>
  <v-checkbox
    v-for="handout in graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-handout') || []"
    :key="handout.id"
    :value="handout.id"
    density="compact"
    hide-details
    :label="handout.data.name"
    :model-value="list"
    @update:model-value="v => emits('update', v)"
  />
</template>

<script setup lang="ts">
import { inject } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  list: string[]
}>()

const emits = defineEmits<{
  (e: 'update', value: string[]): Promise<void>
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
