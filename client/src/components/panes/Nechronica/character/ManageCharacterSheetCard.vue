<template>
  <v-card
    variant="elevated"
    rounded="lg"
    :color="NechronicaTypeColorMap.find(t => t.type === character.data.type)?.color || ''"
  >
    <v-card-title class="text-body-1 d-flex flex-row justify-start align-center">
      <span class="ellipsis flex-grow-1" style="width: 1em">{{ character.data.character.basic.characterName }}</span>
      <link-btn :href="character.data.character.url" />
    </v-card-title>
    <v-card-text class="py-1 px-2 d-flex flex-column flex-wrap align-end" style="gap: 0.3rem">
      <menu-edit-text-field
        :editable="true"
        variant="solo-filled"
        :width="18"
        icon="mdi-tag-text-outline"
        :label="`${NechronicaTypeColorMap.find(t => t.type === character.data.type)?.text || ''}名`"
        :text="character.data.character.basic.characterName"
        @update="v => onUpdateCharacterName(character.id, v)"
      />
      <menu-edit-text-field
        v-if="character.data.type === 'legion'"
        :editable="true"
        :width="11"
        :min="-99"
        variant="solo-filled"
        label="数"
        type="number"
        :text="character?.data.health?.toString() || '0'"
        @update="v => onUpdateCharacterHealth(character.id, parseInt(v, 10))"
      />
      <v-switch
        v-if="!perspective && character.data.type !== 'doll'"
        color="primary"
        true-icon="mdi-check"
        label="参加者に見せる"
        :hide-details="true"
        density="compact"
      />
      <v-select-thin
        prefix="初期配置"
        style="max-width: 10em"
        :items="positionSelection"
        :model-value="character.data.character.basic.basePosition.toString() || '0'"
        @update:model-value="v => onUpdateCharacterBasePosition(character.id, parseInt(v, 10))"
      />
      <v-btn
        v-if="['legion', 'horror'].includes(character.data.type)"
        variant="text"
        class="text-decoration-underline"
        text="複製する"
        @click="onCopyLegion()"
      />
      <reload-character-sheet-btn :character-id="character.id" />
      <delete-menu-btn
        :target-name="character.data.character.basic.characterName"
        :type="NechronicaTypeColorMap.find(t => t.type === character.data.type)?.text || ''"
        location="bottom center"
        @execute="() => graphQlStore?.deleteSessionData(character.id)"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { Layout } from '@/components/panes'
import { computed, inject, ref } from 'vue'

import DeleteMenuBtn from '@/components/DeleteMenuBtn.vue'
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ReloadCharacterSheetBtn from '@/components/panes/Nechronica/component/ReloadCharacterSheetBtn.vue'
import VSelectThin from '@/components/panes/Nechronica/component/VSelectThin.vue'
import {
  NechronicaCopiableWrap,
  NechronicaTypeColorMap,
  NechronicaWrap
} from '@/components/panes/Nechronica/nechronica'
import LinkBtn from '@/components/parts/LinkBtn.vue'
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const isUserControl = computed(() => Boolean(graphQlStore?.state.user?.token))

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  character: { id: string; data: NechronicaWrap }
}>()

// eslint-disable-next-line unused-imports/no-unused-vars
const emits = defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
}>()

const perspective = ref(isUserControl.value ? '' : graphQlStore?.state.player?.id || '')

async function onCopyLegion() {
  const legion: { id: string; data: NechronicaWrap } | undefined = graphQlStore?.state.sessionDataList.find(
    sd => sd.id === props.character.id
  )
  if (!legion) return
  const copyProps: NechronicaCopiableWrap = {
    position: legion.data.position,
    actionValue: legion.data.actionValue,
    health: legion.data.health,
    hide: legion.data.hide,
    maxActionValue: legion.data.maxActionValue
  }
  await graphQlStore?.addNechronicaCharacter(legion.data.player, 'legion', legion.data.character, copyProps)
}

async function onUpdateCharacterName(characterId: string, name: string) {
  await graphQlStore?.updateNechronicaCharacterHelper(characterId, cloned => {
    cloned.character.basic.characterName = name
  })
}

async function onUpdateCharacterHealth(characterId: string, health: number) {
  await graphQlStore?.updateNechronicaCharacterHelper(characterId, cloned => {
    cloned.health = health
  })
}

async function onUpdateCharacterBasePosition(characterId: string, position: number) {
  await graphQlStore?.updateNechronicaCharacterHelper(characterId, cloned => {
    cloned.character.basic.basePosition = position
  })
}

const positionSelection = [
  { value: '-3', text: '' },
  { value: '-2', text: '奈落' },
  { value: '-1', text: '地獄' },
  { value: '0', text: '煉獄' },
  { value: '1', text: '花園' },
  { value: '2', text: '楽園' }
]
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
$title-height: 2rem;

.sticky-title {
  position: sticky;
  top: 0;
  height: $title-height;
  box-sizing: border-box;
  padding-top: 0;
  padding-bottom: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  z-index: 2;
}
.sticky-subtitle {
  position: sticky;
  top: $title-height;
  z-index: 1;
  opacity: 1;
}
</style>
