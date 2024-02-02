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
    @update:model-value="
      v =>
        emits(
          'update',
          [v].flat().map(v => v?.toString() || '')
        )
    "
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

const props = defineProps<{
  list: string[]
  exclude?: string
  editable: boolean
  perspective: string
}>()

const emits = defineEmits<{
  (e: 'update', value: string[]): Promise<void>
}>()

const dataList = computed(() => {
  const handoutList =
    graphQlStore?.state.sessionDataList.filter(sd => {
      if (sd.type !== 'shinobigami-handout') return false
      if (props.exclude && sd.id === props.exclude) return false
      if (!props.perspective || sd.data.published) return true

      // 公開してなくても担当キャラだったらハンドアウトが見える
      const character = graphQlStore.state.sessionDataList.find(sdc => sdc.id === sd.data.person)
      const player = graphQlStore.state.players.find(p => p.id === character?.data.player)
      if (player?.id === props.perspective) return true

      // 公開していなくても関係のあるハンドアウトなら見える
      return graphQlStore.state.sessionDataList.some(r => {
        if (r.type !== 'shinobigami-handout-relation' || r.data.targetId !== sd.id) return false
        const handout = graphQlStore.state.sessionDataList.find(sdc => sdc.id === r.data.ownerId)
        const character = graphQlStore.state.sessionDataList.find(sdc => sdc.id === handout?.data.person)
        const player = graphQlStore.state.players.find(p => p.id === character?.data.player)
        return player?.id === props.perspective
      })
    }) || []
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
