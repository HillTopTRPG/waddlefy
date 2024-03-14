<template>
  <v-timeline-item icon="mdi-chevron-up" :dot-color="typeMapping[data.type].color">
    <template #opposite>
      <v-card class="text-left pr-2" variant="flat">
        <v-card-title class="pa-0" :class="`text-${typeMapping[data.type].color}`">
          {{ index }}. {{ $t(typeMapping[data.type].label) }}
        </v-card-title>
        <maneuver-stack-cancel-btn v-if="!data.status" @execute="emits('cancel')" />
      </v-card>
    </template>
    <template #default>
      <v-card class="text-left pr-2" variant="flat">
        <v-card-text class="pt-1 pb-0 px-2 d-flex flex-row align-baseline">
          <v-sheet class="ellipsis" style="width: 24em">
            <span class="text-body-2">{{ maneuverCardLabel }}</span>
            <span class="text-caption d-block text-pre-wrap">{{ moveText }}</span>
          </v-sheet>
        </v-card-text>
        <v-card-text class="pt-0 pb-1 px-2" v-if="character && maneuver">
          <maneuver-view-card
            mode="history-stack"
            :history-type="data.type"
            :over-cost="overCost"
            :has-bravado="false"
            :type="character?.data.type!"
            :maneuver="maneuver!"
            :perspective="perspective"
          />
        </v-card-text>
      </v-card>
    </template>
  </v-timeline-item>
</template>

<script setup lang="ts">
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ManeuverStackCancelBtn from '@/components/panes/Nechronica/maneuver-stack/ManeuverStackCancelBtn.vue'
import ManeuverViewCard from '@/components/panes/Nechronica/maneuver/ManeuverViewCard.vue'
import mapping from '@/components/panes/Nechronica/mapping.json'
import {
  NechronicaManeuver,
  NechronicaManeuverStack,
  NechronicaManeuverStackType,
  NechronicaWrap
} from '@/components/panes/Nechronica/nechronica'
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  index: number
  data: NechronicaManeuverStack
  perspective: string
}>()

const emits = defineEmits<{
  (e: 'cancel'): void
}>()

const overCost = computed(() => (props.data.type === 'use' ? props.data.cost : undefined))

const character = computed((): { id: string; data: NechronicaWrap } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.data.characterId)
})

function getLocationText(location: number | undefined) {
  const positionStr = location?.toString(10) || '0'
  const locationRaw = mapping.CHARACTER_LOCATION.find(cl => cl['pos-value'] === positionStr)?.text
  return locationRaw ? t(locationRaw) : ''
}

const maneuverCardLabel = computed(() => character.value?.data.character.basic.characterName)

const moveText = computed(() => {
  const atTheTime = getLocationText(props.data.place)
  if (props.data.type !== 'move') {
    const now = getLocationText(character.value?.data.position)
    const atTheTimeLabel = t('Nechronica.label.place-at-the-time')
    const nowLabel = t('Nechronica.label.place-now')
    return `${atTheTimeLabel}: ${atTheTime}\n${nowLabel}: ${now}`
  }
  const before = getLocationText(props.data.beforePlace)
  return `${before} → ${atTheTime}`
})

const typeMapping: { [type in NechronicaManeuverStackType]: { color: string; label: string } } = {
  use: {
    color: 'info',
    label: 'Nechronica.label.use'
  },
  lost: {
    color: 'error',
    label: 'Nechronica.label.lost'
  },
  move: {
    color: 'success',
    label: 'Nechronica.label.move'
  }
}

const maneuver = computed((): NechronicaManeuver | undefined => {
  if (props.data.type !== 'use' && props.data.type !== 'lost') return undefined
  if ((character.value?.data.character.maneuverList.length || 0) <= props.data.maneuverIndex) {
    return undefined
  }
  return character.value?.data.character.maneuverList[props.data.maneuverIndex]
})
</script>

<style lang="scss" scoped>
.text {
  font-size: 11px;
  max-width: 4em;
}

:deep(.v-timeline-item__body) {
  padding-inline-start: 0 !important;
}

:deep(.v-timeline-item__opposite) {
  padding-inline-end: 0 !important;
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
    transform: rotate(15deg) translate(-0.3rem, 0.5rem);
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
