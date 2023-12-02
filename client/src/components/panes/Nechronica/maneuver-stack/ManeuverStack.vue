<template>
  <v-card
    class="maneuver-stack d-flex flex-row align-center my-0 pr-1"
    style="outline-offset: -3px"
    :style="isResolvedStack ? 'margin-right: -7rem;' : ''"
    rounded="xl"
    :color="currentData?.type === 'use' ? 'blue-lighten-3' : 'deep-orange-lighten-2'"
  >
    <v-btn
      icon="mdi-drag-vertical"
      :ripple="false"
      density="comfortable"
      variant="text"
      size="small"
      v-if="!currentData?.status"
      :class="dataList.length ? 'drag-thumb' : ''"
    />
    <v-dialog width="auto" :close-on-content-click="false" :disabled="false">
      <template #activator="{ props }">
        <v-sheet
          class="d-flex flex-row bg-transparent align-center"
          style="cursor: pointer"
          :style="currentData?.status ? 'padding-left: 15px' : ''"
          v-bind="props"
        >
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
          <maneuver-stack-resolve-btn @execute="onResolved" />
        </v-card-text>
        <template v-for="(data, idx) in viewDataList" :key="idx">
          <v-card-text v-if="idx" class="d-flex flex-row justify-space-around py-0">
            <v-icon v-for="n in 7" :key="n" :icon="n % 2 === 0 ? 'mdi-arrow-up-bold' : 'mdi-arrow-up-bold-outline'" />
          </v-card-text>
          <maneuver-stack-content :data="data" />
        </template>
      </v-card>
    </v-dialog>
    <v-overlay
      :contained="true"
      :scrim="false"
      :persistent="true"
      :model-value="!isResolvedStack && Boolean(currentData?.status)"
      class="eventless"
    >
      <span class="contents px-1">処理済</span>
    </v-overlay>
  </v-card>
</template>

<script setup lang="ts">
// eslint-disable-next-line unused-imports/no-unused-vars
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ManeuverStackContent from '@/components/panes/Nechronica/maneuver-stack/ManeuverStackContent.vue'
import ManeuverStackHelpBtn from '@/components/panes/Nechronica/maneuver-stack/ManeuverStackHelpBtn.vue'
import ManeuverStackResolveBtn from '@/components/panes/Nechronica/maneuver-stack/ManeuverStackResolveBtn.vue'
import ManeuverBtn from '@/components/panes/Nechronica/maneuver/ManeuverBtn.vue'
import { NechronicaManeuver, NechronicaManeuverStack, NechronicaWrap } from '@/components/panes/Nechronica/nechronica'
import { computed, inject } from 'vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  index: number
  dataList: (NechronicaManeuverStack & { id: string })[]
}>()

const emits = defineEmits<{
  (e: 'resolve'): void
}>()

const viewDataList = computed(() => {
  console.log(`-- ${props.index}`)
  const c = props.dataList[props.index]
  if (!c.status) {
    const startIndex = props.dataList.findIndex(d => !d.status)
    console.log(startIndex, props.index + 1)
    return props.dataList.slice(startIndex, props.index + 1).reverse()
  }
  return props.dataList.slice(c.start, c.end + 1).reverse()
})

const isResolvedStack = computed(() => {
  const c = props.dataList[props.index]
  if (!c.status) return false
  return props.index !== c.end
})

const currentData = computed(() => {
  if (!props.dataList.length) return undefined
  return props.dataList[props.index]
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
  return characters.value[props.index]
})

const currentManeuver = computed(() => {
  if (!maneuvers.value) return undefined
  return maneuvers.value[props.index]
})

function onResolved() {
  emits('resolve')
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.text {
  font-size: 11px;
  max-width: 4em;
}

.eventless {
  pointer-events: none;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-end;

  :deep(.v-overlay__content) {
    pointer-events: none;
    display: contents;
  }

  $bg-color: rgba(var(--v-theme-info), 1);
  $bg-color: #c51162;
  .contents {
    position: relative;
    height: 1.5em;
    display: block;
    background-color: $bg-color;
    opacity: 0.8;
    color: white;
    transform: rotate(15deg) translate(-1.5rem, 0.8rem);
    transform-origin: center;
    padding: 0;

    &::before,
    &::after {
      height: 100%;
      content: '';
      position: absolute;
      top: 0;
      width: 20px;
    }
    &::before {
      left: -20px;
      background: linear-gradient(325deg, $bg-color 8px, transparent 0),
        linear-gradient(240deg, $bg-color 12px, transparent 0);
      background-size: 30px 10px;
    }
    $offset: 7px;
    &::after {
      z-index: -1;
      right: -17px;
      background:
        0 $offset linear-gradient(240deg, transparent 25px, $bg-color 0),
        0 $offset linear-gradient(323deg, transparent 22px, $bg-color 0);
      background-size: 30px 10px;
    }
  }
}
</style>
