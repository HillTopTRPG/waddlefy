<template>
  <v-menu>
    <template #activator="{ props }">
      <v-card
        class="d-flex flex-row align-center my-1 pl-4 pr-2"
        rounded="xl"
        :color="data.type === 'use' ? 'blue-lighten-3' : 'deep-orange-lighten-2'"
        v-bind="props"
      >
        <v-sheet class="d-flex flex-column bg-transparent">
          <span class="">{{ data.type === 'use' ? '使用' : '損傷' }}</span>
          <span class="ellipsis text">{{ character?.data.character.basic.characterName || '' }}</span>
          <span class="ellipsis text">{{ maneuver?.name || '' }}</span>
        </v-sheet>
        <maneuver-btn mode="icon" size="small" :maneuver="maneuver" />
      </v-card>
    </template>
    <v-card class="pa-0">
      <v-card-title>{{ data.type === 'use' ? '使用' : '損傷' }}</v-card-title>
      <v-card-text class="py-0 px-2 d-flex flex-row">
        <v-sheet class="text-body-1 ellipsis" style="width: 1em; flex-grow: 1">{{
          character?.data.character.basic.characterName
        }}</v-sheet>
      </v-card-text>
      <v-card-text class="pt-0 pb-2 px-2">
        <maneuver-view-card mode="view-simple" :has-heiki="false" :type="character?.data.type" :maneuver="maneuver" />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
// eslint-disable-next-line unused-imports/no-unused-vars
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ManeuverBtn from '@/components/panes/Nechronica/maneuver/ManeuverBtn.vue'
import ManeuverViewCard from '@/components/panes/Nechronica/maneuver/ManeuverViewCard.vue'
import { NechronicaManeuver, NechronicaManeuverStack, NechronicaWrap } from '@/components/panes/Nechronica/nechronica'
import { computed, inject } from 'vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  data: NechronicaManeuverStack
}>()

const character = computed((): { id: string; data: NechronicaWrap } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.data.characterId)
})

const maneuver = computed((): NechronicaManeuver | undefined => {
  return character.value?.data.character.maneuverList[props.data.maneuverIndex]
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.text {
  font-size: 11px;
  max-width: 4em;
}
</style>
