<template>
  <v-card
    variant="elevated"
    rounded="lg"
    class="pb-2"
    :color="mapping.CHARACTER_TYPE.find(t => t.type === character.data.type)?.color || ''"
  >
    <v-card-title class="text-body-1 d-flex flex-row justify-start align-center px-2 pt-1 pb-0">
      <icon-btn
        class="mr-1"
        :class="
          character.data.type === 'doll'
            ? mapping.CHARACTER_POSITION[character.data.character.basic.position].val
            : `type-${character.data.type}`
        "
        size="x-small"
      />
      <span class="ellipsis flex-grow-1" style="width: 1em">{{ character.data.character.basic.characterName }}</span>
      <link-btn :href="character.data.character.url" />
    </v-card-title>
    <v-card-text
      class="py-0 px-2 d-flex flex-column flex-wrap align-end"
      :class="!perspective || character.data.type === 'doll' ? '' : 'pt-1'"
    >
      <menu-edit-text-field
        :editable="!perspective || character.data.type === 'doll'"
        :variant="!perspective || character.data.type === 'doll' ? 'solo-filled' : 'outlined'"
        :width="18"
        icon="mdi-tag-text-outline"
        :label="
          $t('label.name-of').replace(
            '$$',
            $t(
              mapping.CHARACTER_TYPE.find(t => t.type === character.data.type)?.text || 'Nechronica.CHARACTER_TYPE.none'
            )
          )
        "
        :text="character.data.character.basic.characterName"
        @update="v => onUpdateCharacterName(character.id, v)"
      />
      <v-sheet
        class="d-flex flex-row bg-transparent align-center w-100 mt-2"
        :class="!perspective || character.data.type === 'doll' ? '' : 'pt-1'"
      >
        <v-select
          style="max-width: 8em"
          :items="mapping.CHARACTER_LOCATION.map(d => ({ value: d['init-pos-value'], text: d.text }))"
          :readonly="Boolean(perspective) && character.data.type !== 'doll'"
          item-title="text"
          item-value="value"
          :hide-details="true"
          :variant="!perspective || character.data.type === 'doll' ? 'solo-filled' : 'outlined'"
          :flat="true"
          :model-value="character.data.character.basic.basePosition.toString() || '0'"
          @update:model-value="v => onUpdateCharacterBasePosition(character.id, parseInt(v, 10))"
        >
          <template #label>
            <v-icon icon="mdi-map-marker-outline" />
            <span>{{ $t('Nechronica.label.init-placement') }}</span>
          </template>
          <template #item="{ item, props }">
            <v-list-item v-bind="props" :title="$t(item.title)" />
          </template>
          <template #selection="{ item }">
            <v-list-item density="compact" class="pa-0" :title="$t(item.title)" />
          </template>
        </v-select>
        <template v-if="character.data.type === 'legion'">
          <v-spacer />
          <menu-edit-text-field
            :editable="!perspective"
            :width="7"
            :min="-99"
            :variant="perspective ? 'outlined' : 'solo-filled'"
            icon="mdi-chess-pawn"
            :label="$t('Nechronica.label.legion-health')"
            type="number"
            :text="character?.data.health?.toString() || '0'"
            @update="v => onUpdateCharacterHealth(character.id, parseInt(v, 10))"
          />
        </template>
      </v-sheet>
      <template v-if="!perspective">
        <v-sheet class="d-flex flex-row align-center bg-transparent w-100 pt-2">
          <v-switch
            v-if="character.data.type !== 'doll'"
            color="primary"
            class="ml-2"
            true-icon="mdi-eye-outline"
            false-icon="mdi-eye-off-outline"
            :label="$t('Nechronica.label.view-to-player')"
            :hide-details="true"
            density="compact"
            :model-value="!character.data.hide"
            @update:model-value="(v: any) => onUpdateCharacterHide(character.id, !v as boolean)"
          />
          <v-spacer />
          <v-btn v-if="['legion', 'horror'].includes(character.data.type)" variant="text" @click="onCopyCharacter()">
            <v-icon icon="mdi-content-copy" />
            <span class="text-decoration-underline">{{ $t('Nechronica.label.duplicate') }}</span>
          </v-btn>
        </v-sheet>
      </template>
      <template v-if="!perspective || character.data.type === 'doll'">
        <reload-character-sheet-btn :character-id="character.id" />
        <delete-menu-btn
          :target-name="character.data.character.basic.characterName"
          :type="mapping.CHARACTER_TYPE.find(t => t.type === character.data.type)?.text || ''"
          location="bottom center"
          :i18n="true"
          @execute="() => graphQlStore?.deleteSessionData(character.id)"
        />
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { inject } from 'vue'

import DeleteMenuBtn from '@/components/DeleteMenuBtn.vue'
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ReloadCharacterSheetBtn from '@/components/panes/Nechronica/component/ReloadCharacterSheetBtn.vue'
import IconBtn from '@/components/panes/Nechronica/maneuver/IconBtn.vue'
import mapping from '@/components/panes/Nechronica/mapping.json'
import { NechronicaCopiableWrap, NechronicaWrap } from '@/components/panes/Nechronica/nechronica'
import LinkBtn from '@/components/parts/LinkBtn.vue'
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  character: { id: string; data: NechronicaWrap }
  perspective: string
}>()

async function onCopyCharacter() {
  const character: { id: string; data: NechronicaWrap } | undefined = graphQlStore?.state.sessionDataList.find(
    sd => sd.id === props.character.id
  )
  if (!character) return
  const copyProps: NechronicaCopiableWrap = {
    position: character.data.position,
    actionValue: character.data.actionValue,
    health: character.data.health,
    hide: true,
    maxActionValue: character.data.maxActionValue,
    spineCount: character.data.spineCount || 0
  }
  await graphQlStore?.addNechronicaCharacter(
    character.data.player,
    character.data.type,
    character.data.character,
    copyProps
  )
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

async function onUpdateCharacterHide(characterId: string, hide: boolean) {
  await graphQlStore?.updateNechronicaCharacterHelper(characterId, cloned => {
    cloned.hide = hide
  })
}

async function onUpdateCharacterBasePosition(characterId: string, position: number) {
  await graphQlStore?.updateNechronicaCharacterHelper(characterId, cloned => {
    cloned.character.basic.basePosition = position
  })
}
</script>

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
