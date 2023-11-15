<template>
  <v-card class="pb-3 bg-lime-lighten-4" style="max-width: 20rem">
    <v-card-title class="text-pre-wrap">{{ prize.name }}</v-card-title>
    <v-card-text class="pb-2">
      <v-label class="text-caption">効果</v-label>
      <v-sheet class="text-pre-wrap text-body-2 bg-transparent">{{ prize.description || '(未記入)' }}</v-sheet>
    </v-card-text>
    <v-card-text class="pt-0 pb-2" v-if="isPrizeSecret(prize.leakedList)">
      <v-label class="text-caption">秘密</v-label>
      <v-sheet class="text-pre-wrap text-body-2 bg-transparent">{{ prize.secret || '(未記入)' }}</v-sheet>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { ShinobigamiPrize } from '@/components/panes/Shinobigami/shinobigami'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  prize: ShinobigamiPrize
}>()

function isPrizeSecret(prizeLeakedList: string[]) {
  if (!props.perspective) return true
  return prizeLeakedList.some(l => {
    const leakedHandout = graphQlStore?.state.sessionDataList.find(sd => sd.id === l)
    if (!leakedHandout) return false
    const leakedCharacter = graphQlStore?.state.sessionDataList.find(sd => sd.id === leakedHandout.data.person)
    if (!leakedCharacter) return false
    return leakedCharacter.data.player === props.perspective
  })
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
