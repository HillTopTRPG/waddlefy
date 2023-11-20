<template>
  <v-checkbox
    v-for="data in dataList"
    :key="data.id"
    :value="data.id"
    :label="data.name"
    :readonly="!editable"
    density="compact"
    :hide-details="true"
    :model-value="list"
    @update:model-value="v => emits('update', [v].flat().map(v => v.toString()))"
  >
    <template #label="{ label }">
      <span style="text-overflow: ellipsis; max-width: 16.5rem; overflow: hidden; white-space: nowrap">{{
        label
      }}</span>
    </template>
  </v-checkbox>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  list: string[]
  exclude?: string
  editable: boolean
}>()

const emits = defineEmits<{
  (e: 'update', value: string[]): Promise<void>
}>()

const dataList = computed(() => {
  const handoutList =
    graphQlStore?.state.sessionDataList.filter(
      sd => sd.type === 'shinobigami-handout' && (props.exclude ? sd.id !== props.exclude : true)
    ) || []
  return handoutList.map(h => {
    const characterInfo = graphQlStore?.state.sessionDataList.find(sd => sd.id === h.data.person)
    const nameList = [h.data.name]
    if (characterInfo) {
      const characterName = characterInfo.data.character.characterName
      if (characterName) {
        nameList.push(` : ${characterName}`)
      }
      if (characterInfo.data.player) {
        const player = graphQlStore?.state.players.find(p => p.id === characterInfo.data.player)
        if (player) {
          nameList.push(` (${player.name})`)
        }
      }
    }
    return {
      id: h.id,
      name: nameList.join('')
    }
  })
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
