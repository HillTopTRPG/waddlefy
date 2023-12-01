<template>
  <v-card
    class="maneuver-stack d-flex flex-row align-center my-0 pr-1"
    style="outline-offset: -3px"
    rounded="xl"
    :color="dataList[0].type === 'use' ? 'blue-lighten-3' : 'deep-orange-lighten-2'"
  >
    <v-btn
      icon="mdi-drag-vertical"
      :ripple="false"
      density="comfortable"
      variant="text"
      size="small"
      :class="viewThumb ? 'drag-thumb' : ''"
    />
    <v-dialog width="auto" :close-on-content-click="false" :disabled="false">
      <template #activator="{ props }">
        <v-sheet class="d-flex flex-row bg-transparent align-center" style="cursor: pointer" v-bind="props">
          <v-sheet class="d-flex flex-column bg-transparent">
            <span class="">{{ currentData?.type === 'use' ? '使用' : '損傷' }}</span>
            <span class="ellipsis text">{{ currentCharacter?.data.character.basic.characterName || '' }}</span>
            <span class="ellipsis text">{{ currentManeuver?.name || '' }}</span>
          </v-sheet>
          <maneuver-btn v-if="currentManeuver" mode="icon" size="small" :maneuver="currentManeuver" />
        </v-sheet>
      </template>
      <v-card class="px-0 pt-1 pb-1 d-flex flex-column">
        <v-card-text class="py-1 d-flex flex-row align-center px-2">
          <maneuver-stack-help-btn />
          <v-spacer />
          <maneuver-stack-delete-btn @execute="onDeleteAll" />
        </v-card-text>
        <template v-for="(data, idx) in dataList" :key="idx">
          <v-card-text v-if="idx" class="d-flex flex-row justify-space-around py-0">
            <v-icon v-for="n in 7" :key="n" :icon="n % 2 === 0 ? 'mdi-arrow-up-bold' : 'mdi-arrow-up-bold-outline'" />
          </v-card-text>
          <v-card-text class="pt-1 pb-0 px-2 d-flex flex-row align-baseline">
            <span class="text-h6">{{ data.type === 'use' ? '使用' : '損傷' }}&nbsp;</span>
            <v-sheet class="text-body-2 ellipsis" style="width: 1em; flex-grow: 1">{{
              characters[idx]?.data.character.basic.characterName
            }}</v-sheet>
            <maneuver-stack-cancel-btn @execute="onCancel(idx)" />
          </v-card-text>
          <v-card-text class="pt-0 pb-1 px-2">
            <maneuver-view-card
              v-if="characters[idx] && maneuvers[idx]"
              mode="view-simple"
              :has-heiki="false"
              :type="characters[idx]?.data.type!"
              :maneuver="maneuvers[idx]!"
            />
          </v-card-text>
        </template>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
// eslint-disable-next-line unused-imports/no-unused-vars
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ManeuverStackCancelBtn from '@/components/panes/Nechronica/maneuver-stack/ManeuverStackCancelBtn.vue'
import ManeuverStackDeleteBtn from '@/components/panes/Nechronica/maneuver-stack/ManeuverStackDeleteBtn.vue'
import ManeuverStackHelpBtn from '@/components/panes/Nechronica/maneuver-stack/ManeuverStackHelpBtn.vue'
import ManeuverBtn from '@/components/panes/Nechronica/maneuver/ManeuverBtn.vue'
import ManeuverViewCard from '@/components/panes/Nechronica/maneuver/ManeuverViewCard.vue'
import { NechronicaManeuver, NechronicaManeuverStack, NechronicaWrap } from '@/components/panes/Nechronica/nechronica'
import { computed, inject } from 'vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  dataList: NechronicaManeuverStack[]
  viewThumb: boolean
}>()

const emits = defineEmits<{
  (e: 'delete'): void
}>()

const currentData = computed(() => {
  if (!props.dataList.length) return undefined
  return props.dataList[0]
})

const characters = computed((): ({ id: string; data: NechronicaWrap } | undefined)[] => {
  return props.dataList.map(data => {
    return graphQlStore?.state.sessionDataList.find(sd => sd.id === data.characterId)
  })
})

const maneuvers = computed((): (NechronicaManeuver | undefined)[] => {
  return props.dataList.map((data, idx) => {
    const maneuverList = characters.value[idx]?.data.character.maneuverList || []
    if (maneuverList.length <= data.maneuverIndex) return undefined
    return maneuverList[data.maneuverIndex]
  })
})

const currentCharacter = computed(() => {
  if (!characters.value) return undefined
  return characters.value[0]
})

const currentManeuver = computed(() => {
  if (!maneuvers.value) return undefined
  return maneuvers.value[0]
})

function onDeleteAll() {
  emits('delete')
}

function onCancel(idx: number) {
  console.log(idx)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.text {
  font-size: 11px;
  max-width: 4em;
}
</style>
