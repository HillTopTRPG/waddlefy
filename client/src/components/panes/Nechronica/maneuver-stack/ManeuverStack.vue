<template>
  <v-card
    class="maneuver-stack d-flex flex-row align-center my-0 pr-1"
    style="outline-offset: -3px; min-width: 8rem"
    :style="isResolvedStack ? 'margin-right: -7rem;' : ''"
    rounded="xl"
    v-if="currentData"
    :color="typeMapping[currentData?.type]"
  >
    <v-btn
      icon="mdi-drag-vertical"
      :ripple="false"
      density="comfortable"
      variant="text"
      size="small"
      :style="currentData?.status ? 'opacity: 0; cursor: default' : ''"
      :class="dataList.length ? 'drag-thumb' : ''"
    />
    <v-dialog width="auto" :close-on-content-click="false" :disabled="false">
      <template #activator="{ props }">
        <v-sheet class="d-flex flex-row bg-transparent align-start h-100" style="cursor: pointer" v-bind="props">
          <v-sheet class="d-flex flex-column justify-start bg-transparent">
            <template v-if="currentData?.type === 'use'">
              <span>{{ $t('Nechronica.label.use') }}</span>
              <span class="ellipsis text thin">{{ currentCharacter?.data.character.basic.characterName || '' }}</span>
              <span class="ellipsis text thin">{{ currentManeuver?.name || '' }}</span>
            </template>
            <template v-if="currentData?.type === 'lost'">
              <span>{{ $t('Nechronica.label.lost') }}</span>
              <span class="ellipsis text thin">{{ currentCharacter?.data.character.basic.characterName || '' }}</span>
              <span class="ellipsis text thin">{{ currentManeuver?.name || '' }}</span>
            </template>
            <template v-if="currentData?.type === 'move'">
              <span>{{ $t('Nechronica.label.move') }}</span>
              <span class="ellipsis text wide">{{ currentCharacter?.data.character.basic.characterName || '' }}</span>
              <span class="ellipsis text wide">{{ moveText }}</span>
            </template>
          </v-sheet>
          <maneuver-btn
            v-if="currentManeuver"
            :type="currentCharacter?.data.type"
            :character="currentCharacter?.data.character"
            mode="icon"
            size="small"
            class="align-self-center"
            :maneuver="currentManeuver"
            :disable-button="true"
          />
        </v-sheet>
      </template>
      <v-card class="px-0 pt-1 pb-1 d-flex flex-column">
        <v-card-text class="py-1 d-flex flex-row align-center px-2">
          <maneuver-stack-resolve-btn v-if="!currentData?.status" @execute="onResolved" />
          <v-spacer />
          <maneuver-stack-help-btn />
        </v-card-text>
        <v-timeline align="start" side="end" class="ml-2" density="comfortable">
          <template v-for="(data, idx) in viewDataList" :key="idx">
            <maneuver-stack-content
              :index="viewDataList.length - idx"
              :data="data.data"
              @cancel="onCancel(data.index)"
            />
          </template>
        </v-timeline>
      </v-card>
    </v-dialog>
    <v-overlay
      :contained="true"
      :scrim="false"
      :persistent="true"
      :model-value="!isResolvedStack && Boolean(currentData?.status)"
      class="eventless"
    >
      <span class="contents px-1">{{ $t('Nechronica.label.processed') }}</span>
    </v-overlay>
  </v-card>
</template>

<script setup lang="ts">
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ManeuverStackContent from '@/components/panes/Nechronica/maneuver-stack/ManeuverStackContent.vue'
import ManeuverStackHelpBtn from '@/components/panes/Nechronica/maneuver-stack/ManeuverStackHelpBtn.vue'
import ManeuverStackResolveBtn from '@/components/panes/Nechronica/maneuver-stack/ManeuverStackResolveBtn.vue'
import ManeuverBtn from '@/components/panes/Nechronica/maneuver/ManeuverBtn.vue'
import mapping from '@/components/panes/Nechronica/mapping.json'
import {
  NechronicaManeuver,
  NechronicaManeuverStack,
  NechronicaManeuverStackType,
  NechronicaWrap
} from '@/components/panes/Nechronica/nechronica'
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  index: number
  dataList: (NechronicaManeuverStack & { id: string })[]
}>()

const emits = defineEmits<{
  (e: 'resolve'): void
  (e: 'cancel', idx: number): void
}>()

const typeMapping: { [type in NechronicaManeuverStackType]: string } = {
  use: 'blue-lighten-3',
  lost: 'deep-orange-lighten-2',
  move: 'green-lighten-2'
}

const viewDataList = computed(() => {
  const c = props.dataList[props.index]
  if (!c.status) {
    const startIndex = props.dataList.findIndex(d => !d.status)
    return props.dataList
      .map((data, index) => ({ index, data }))
      .slice(startIndex, props.index + 1)
      .reverse()
  }
  return props.dataList
    .map((data, index) => ({ index, data }))
    .slice(c.start, c.end + 1)
    .reverse()
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

const { t } = useI18n()

function getLocationText(location: number | undefined) {
  const positionStr = location?.toString(10) || '0'
  const locationRaw = mapping.CHARACTER_LOCATION.find(cl => cl['pos-value'] === positionStr)?.text
  return locationRaw ? t(locationRaw) : ''
}

const moveText = computed(() => {
  if (!currentData.value || currentData.value?.type !== 'move') return undefined
  return `${getLocationText(currentData.value?.beforePlace)} → ${getLocationText(currentData.value?.place)}`
})

const characters = computed((): ({ id: string; data: NechronicaWrap } | undefined)[] => {
  return props.dataList.map(data => {
    return graphQlStore?.state.sessionDataList.find(sd => sd.id === data.characterId)
  })
})

const maneuvers = computed((): (NechronicaManeuver | undefined)[] => {
  return props.dataList.map((data, idx) => {
    const maneuverList = characters.value.at(idx)?.data.character.maneuverList || []
    return data.type === 'use' || data.type === 'lost' ? maneuverList.at(data.maneuverIndex) : undefined
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

function onCancel(idx: number) {
  emits('cancel', idx)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.text {
  font-size: 11px;

  &.wide {
    max-width: 8em;
  }
  &.thin {
    max-width: 4em;
  }
}

.eventless {
  pointer-events: none;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-end;
  font-size: 12px;

  :deep(.v-overlay__content) {
    pointer-events: none;
    display: contents;
  }

  $bg-color: rgba(var(--v-theme-info), 1);
  $bg-color: #c51162;
  .contents {
    position: relative;
    height: 2em;
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: $bg-color;
    opacity: 0.8;
    color: white;
    transform: rotate(15deg) translate(-0.6rem, 0.8rem);
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
