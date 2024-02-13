<template>
  <pane-frame :title="$t('Nechronica.label.character-view-pane-title')">
    <template #title-action>
      <perspective-select v-model="perspective" />
      <v-btn
        :append-icon="nav ? 'mdi-menu-close' : 'mdi-menu-open'"
        size="small"
        variant="text"
        @click="onChangeNav"
        v-if="viewDataNum > 0"
      >
        <span class="text-decoration-underline">{{ $t('label.display-control') }}</span>
      </v-btn>
    </template>
    <template #layout>
      <battle-controller
        :perspective="perspective"
        v-model:battle-timing="battleTiming"
        @update:progress="p => (progress = p)"
        v-if="viewDataNum > 0"
      />
    </template>
    <template #default>
      <maneuver-stack-list />
      <v-sheet
        class="d-flex flex-row flex-wrap align-start px-2 pt-1 pb-2 overflow-auto w-100"
        style="gap: 0.5rem"
        :style="nav ? 'padding-right: 250px !important;' : ''"
      >
        <character-view-pane-help v-if="viewDataNum === 0" class="ma-3" />
        <template v-for="data in dolls" :key="data.id">
          <character-sheet-view
            :character-id="data.id"
            :battle-count="singleton?.data.battleCount || 0"
            :battle-timing="battleTiming"
            :view-option="viewOption"
            :perspective="perspective"
          />
        </template>
        <template v-for="data in savants" :key="data.id">
          <character-sheet-view
            v-if="!perspective || !data.data.hide"
            :character-id="data.id"
            :battle-count="singleton?.data.battleCount || 0"
            :battle-timing="battleTiming"
            :view-option="viewOption"
            :perspective="perspective"
          />
        </template>
        <template v-for="data in horrors" :key="data.id">
          <character-sheet-view
            v-if="!perspective || !data.data.hide"
            :character-id="data.id"
            :battle-count="singleton?.data.battleCount || 0"
            :battle-timing="battleTiming"
            :view-option="viewOption"
            :perspective="perspective"
          />
        </template>
        <template v-for="data in legions" :key="data.id">
          <character-sheet-view
            v-if="!perspective || !data.data.hide"
            :character-id="data.id"
            :battle-count="singleton?.data.battleCount || 0"
            :battle-timing="battleTiming"
            :view-option="viewOption"
            :perspective="perspective"
          />
        </template>
      </v-sheet>
    </template>
    <template #nav>
      <view-option-nav v-model:nav="nav" v-model:option="viewOption" />
    </template>
  </pane-frame>
  <v-overlay
    :model-value="progress < 100"
    :persistent="true"
    :contained="true"
    class="d-flex justify-center align-center"
    style="backdrop-filter: blur(2px)"
  >
    <v-card rounded="xl">
      <v-card-title>{{ $t('Nechronica.label.updating-data') }}</v-card-title>
      <v-card-text class="text-center">
        <v-progress-circular size="150" color="primary" width="15" class="" :model-value="progress">
          <span class="text-h4">{{ progress }}%</span>
        </v-progress-circular>
      </v-card-text>
    </v-card>
  </v-overlay>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name: 'CharacterViewPane',
  label: 'キャラクター閲覧'
}
</script>

<script setup lang="ts">
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import { computed, inject, ref } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import PerspectiveSelect from '@/components/panes/Nechronica/PerspectiveSelect.vue'
import CharacterSheetView from '@/components/panes/Nechronica/character/CharacterSheetView.vue'
import BattleController from '@/components/panes/Nechronica/component/BattleController.vue'
import CharacterViewPaneHelp from '@/components/panes/Nechronica/component/CharacterViewPaneHelp.vue'
import ViewOptionNav, { NechronicaViewOption } from '@/components/panes/Nechronica/component/ViewOptionNav.vue'
import ManeuverStackList from '@/components/panes/Nechronica/maneuver-stack/ManeuverStackList.vue'
import mapping from '@/components/panes/Nechronica/mapping.json'
import { NechronicaSingleton, NechronicaType, NechronicaWrap } from '@/components/panes/Nechronica/nechronica'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)
const isUserControl = computed(() => Boolean(graphQlStore?.state.user?.token))

defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
}>()

const perspective = ref<string>(isUserControl.value ? '' : graphQlStore?.state.player?.id || '')

const singleton = computed((): { id: string; data: NechronicaSingleton } | undefined =>
  graphQlStore?.state.sessionDataList.find(sd => sd.type === 'nechronica-singleton')
)

const viewOption = ref<NechronicaViewOption>({
  roicePosition: 'before',
  viewLost: true,
  viewUsed: true,
  viewLabel: '',
  selectedTypes: mapping.MANEUVER_TYPE.map((_, idx) => idx),
  selectedTimings: mapping.MANEUVER_TIMING.map((_, idx) => idx)
})

function getCharacters(type: NechronicaType): { id: string; data: NechronicaWrap }[] {
  return (
    graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'nechronica-character' && sd.data.type === type) || []
  )
}

const battleTiming = ref('')

const dolls = computed(() => getCharacters('doll'))
const legions = computed(() => getCharacters('legion'))
const horrors = computed(() => getCharacters('horror'))
const savants = computed(() => getCharacters('savant'))

const viewDataNum = computed(() => {
  let result: number = dolls.value.length
  if (perspective.value) {
    result += legions.value.filter(d => !d.data.hide).length
    result += horrors.value.filter(d => !d.data.hide).length
    result += savants.value.filter(d => !d.data.hide).length
  } else {
    result += legions.value.length
    result += horrors.value.length
    result += savants.value.length
  }
  return result
})

const nav = ref(false)
function onChangeNav() {
  nav.value = !nav.value
}

const progress = ref(100)
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
