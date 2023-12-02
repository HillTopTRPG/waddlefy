<template>
  <v-card-text class="pt-1 pb-0 px-2 d-flex flex-row align-baseline">
    <span class="text-h6">{{ data.type === 'use' ? '使用' : '損傷' }}&nbsp;</span>
    <v-sheet class="text-body-2 ellipsis" style="width: 1em; flex-grow: 1">{{
      character?.data.character.basic.characterName
    }}</v-sheet>
    <maneuver-stack-cancel-btn @execute="emits('cancel')" />
  </v-card-text>
  <v-card-text class="pt-0 pb-1 px-2">
    <maneuver-view-card
      v-if="character && maneuver"
      mode="view-simple"
      :has-heiki="false"
      :over-cost="data.cost"
      :type="character?.data.type!"
      :maneuver="maneuver!"
    />
  </v-card-text>
</template>

<script setup lang="ts">
// eslint-disable-next-line unused-imports/no-unused-vars
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ManeuverStackCancelBtn from '@/components/panes/Nechronica/maneuver-stack/ManeuverStackCancelBtn.vue'
import ManeuverViewCard from '@/components/panes/Nechronica/maneuver/ManeuverViewCard.vue'
import { NechronicaManeuver, NechronicaManeuverStack, NechronicaWrap } from '@/components/panes/Nechronica/nechronica'
import { computed, inject } from 'vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  data: NechronicaManeuverStack
}>()

const emits = defineEmits<{
  (e: 'resolve'): void
  (e: 'cancel'): void
}>()

const character = computed((): { id: string; data: NechronicaWrap } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.data.characterId)
})

const maneuver = computed((): NechronicaManeuver | undefined => {
  if ((character.value?.data.character.maneuverList.length || 0) <= props.data.maneuverIndex) {
    return undefined
  }
  return character.value?.data.character.maneuverList[props.data.maneuverIndex]
})
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
