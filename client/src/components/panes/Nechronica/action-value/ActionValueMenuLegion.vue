<template>
  <v-menu :close-on-content-click="false" scroll-strategy="close">
    <template #activator="{ props }">
      <v-btn variant="text" class="text-body-1 px-0" v-bind="props">
        <div class="d-flex flex-row align-end border border-b-sm border-opacity-100 border-t-0 border-s-0 border-e-0">
          <span class="text-caption">{{ $t('Nechronica.label.action-value') }}: </span>
          <span class="text-h5">{{ character?.data.actionValue || 0 }}/{{ character?.data.maxActionValue || 0 }}</span>
        </div>
        <div
          class="d-flex flex-row align-end pl-2 border border-b-sm border-opacity-100 border-t-0 border-s-0 border-e-0"
        >
          <span class="text-caption text-justify">{{ $t('Nechronica.label.legion-health') }}: </span>
          <span class="text-h5">{{ character?.data.health || 0 }}</span>
        </div>
      </v-btn>
    </template>
    <v-card class="pa-2">
      <v-card-title class="pa-0">{{ $t('Nechronica.label.action-value') }}</v-card-title>
      <v-card-text class="pa-0">
        <menu-edit-text-field
          :editable="true"
          :width="11"
          variant="solo-filled"
          :label="$t('Nechronica.label.action-value')"
          type="number"
          :text="character?.data.actionValue?.toString() || '0'"
          @update="v => onUpdateActionValue(v)"
        />
      </v-card-text>
      <v-card-title class="px-0 py-1">{{ $t('Nechronica.label.max-action-value') }}</v-card-title>
      <v-card-text class="pa-0">
        <menu-edit-text-field
          :editable="true"
          :width="11"
          variant="solo-filled"
          :label="$t('Nechronica.label.max-action-value')"
          type="number"
          :text="character?.data.maxActionValue?.toString() || '0'"
          @update="v => onUpdateMaxActionValue(v)"
        />
      </v-card-text>
      <v-card-title class="px-0 py-1">{{ $t('Nechronica.label.legion-health') }}</v-card-title>
      <v-card-text class="pa-0">
        <menu-edit-text-field
          :editable="true"
          :width="11"
          :min="-99"
          variant="solo-filled"
          :label="$t('Nechronica.label.legion-health')"
          type="number"
          :text="character?.data.health.toString() || '0'"
          @update="v => onUpdateHealth(parseInt(v, 10))"
        />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { NechronicaWrap } from '@/components/panes/Nechronica/nechronica'
import { computed, inject } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  characterId: string
}>()

const emits = defineEmits<{
  (e: 'update:action-value', actionValue: number): Promise<void>
  (e: 'update:max-action-value', maxActionValue: number): Promise<void>
  (e: 'update:health', health: number): Promise<void>
}>()

const character = computed((): { id: string; data: NechronicaWrap } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
})

function onUpdateActionValue(v: string) {
  emits('update:action-value', parseInt(v, 10))
}

function onUpdateMaxActionValue(v: string) {
  emits('update:max-action-value', parseInt(v, 10))
}

function onUpdateHealth(v: number) {
  emits('update:health', v)
}
</script>

<style lang="scss" scoped>
.underline {
  position: relative;

  &:before {
    content: '';
    position: absolute;
    bottom: 2px;
    left: -4px;
    right: -4px;
    margin: auto;
    border-bottom: 1px solid black;
  }
}
</style>
