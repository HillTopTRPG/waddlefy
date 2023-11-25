<template>
  <v-menu :close-on-content-click="false" scroll-strategy="close" location="bottom right">
    <template #activator="{ props }">
      <v-btn icon="mdi-cog" variant="text" size="small" v-bind="props" />
    </template>
    <v-card>
      <v-card-title class="d-flex">
        <span class="ellipsis" style="width: 10em !important">{{ name }}</span>
        <span class="text-no-wrap">の設定</span>
      </v-card-title>
      <v-card-subtitle>１行の最大マニューバ数</v-card-subtitle>
      <v-defaults-provider :defaults="{ VSlider: vSliderDefault }">
        <v-slider show-ticks="always" v-model="useColumns" :min="4" :max="10">
          <template #prepend>
            <span style="width: 1.5em" class="text-right">{{ useColumns }}</span>
          </template>
        </v-slider>
      </v-defaults-provider>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'

const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  characterId: string
  name: string
}>()

const owner = computed(() => (graphQlStore?.state.user?.token ? 'user' : graphQlStore?.state.player?.id || ''))
const characterViewConfig = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => {
    if (sd.type !== 'target-config') return false
    if (sd.data.type !== 'character-view') return false
    return sd.data.owner === owner.value && sd.data.target === props.characterId
  })
})

const useColumns = ref(characterViewConfig.value?.data.data.columns || 10)

let timeout: number | null = null

watch(useColumns, columns => {
  if (timeout !== null) {
    window.clearTimeout(timeout)
    timeout = null
  }
  timeout = window.setTimeout(() => {
    console.log(Boolean(characterViewConfig.value))
    if (characterViewConfig.value) {
      graphQlStore?.updateTargetConfig(characterViewConfig.value.id, owner.value, props.characterId, 'character-view', {
        columns
      })
    } else {
      graphQlStore?.addTargetConfig(owner.value, props.characterId, 'character-view', {
        columns
      })
    }
  }, 1000)
})

const vSliderDefault = {
  density: 'compact',
  persistentHint: true,
  step: 1,
  class: 'ml-3 mr-5',
  rounded: true,
  color: 'primary'
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
