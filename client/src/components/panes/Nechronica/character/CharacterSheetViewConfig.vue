<template>
  <v-dialog width="20em">
    <template #activator="{ props }">
      <v-btn icon="mdi-cog" variant="text" size="small" v-bind="props" />
    </template>
    <v-card>
      <v-card-title class="d-flex">
        <span class="text-no-wrap">{{ $t('label.setting') }}: </span>
        <span class="ellipsis" style="width: 12em !important">{{ name }}</span>
      </v-card-title>
      <v-card-subtitle>{{ $t('Nechronica.label.row-max-maneuver-num') }}</v-card-subtitle>
      <v-defaults-provider :defaults="{ VSlider: vSliderDefault }">
        <v-slider show-ticks="always" v-model="useColumns" :min="4" :max="10">
          <template #prepend>
            <span style="width: 1.5em" class="text-right">{{ useColumns }}</span>
          </template>
        </v-slider>
      </v-defaults-provider>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'

const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  characterId: string
  name: string
}>()

const emits = defineEmits<{
  (e: 'update:columns', columns: number): void
}>()

const owner = computed(() => (graphQlStore?.state.user?.token ? 'user' : graphQlStore?.state.player?.id || ''))
const characterViewConfig = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => {
    if (sd.type !== 'target-config') return false
    if (sd.data.type !== 'character-view') return false
    return sd.data.owner === owner.value && sd.data.target === props.characterId
  })
})

const useColumns = ref<number>(characterViewConfig.value?.data.data.columns || 10)

let timeout: number | null = null

watch(
  useColumns,
  columns => {
    emits('update:columns', columns)
    if (characterViewConfig.value?.data.data.columns === columns) return
    if (timeout !== null) {
      window.clearTimeout(timeout)
      timeout = null
    }
    timeout = window.setTimeout(() => {
      if (characterViewConfig.value) {
        graphQlStore?.updateTargetConfig(
          characterViewConfig.value.id,
          owner.value,
          props.characterId,
          'character-view',
          {
            columns
          }
        )
      } else {
        graphQlStore?.addTargetConfig(owner.value, props.characterId, 'character-view', {
          columns
        })
      }
    }, 5000)
  },
  { immediate: true }
)

const vSliderDefault = {
  density: 'compact',
  persistentHint: true,
  step: 1,
  class: 'ml-3 mr-5',
  rounded: true,
  color: 'primary'
}
</script>

<style lang="scss" scoped></style>
