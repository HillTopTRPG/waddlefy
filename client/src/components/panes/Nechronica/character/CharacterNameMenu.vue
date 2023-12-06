<template>
  <template v-if="character">
    <v-menu :close-on-content-click="false" scroll-strategy="close" location="top left">
      <template #activator="{ props }">
        <v-sheet class="d-flex flex-row text-left align-center bg-transparent">
          <icon-btn :disable-button="true" size="normal" :class="icon" class="mr-1" />
          <v-sheet class="d-flex flex-column flex-grow-1 bg-transparent">
            <v-sheet class="d-flex flex-row bg-transparent">
              <v-sheet
                v-ripple
                v-bind="props"
                rounded="lg"
                class="ellipsis text-h5 text-decoration-underline position-relative overflow-y-hidden bg-transparent"
                style="width: 1em; flex-grow: 1"
              >
                {{ character.data.character.basic.characterName }}
              </v-sheet>
            </v-sheet>
            <v-select-thin
              prefix="配置"
              style="max-width: 8em"
              :items="positionSelection"
              :model-value="character?.data.position.toString() || '0'"
              @update:model-value="v => emits('update:position', parseInt(v, 10))"
            />
          </v-sheet>
        </v-sheet>
      </template>
      <v-card class="pb-1" max-width="20rem">
        <v-card-text class="pt-2 pb-0 d-flex flex-row align-end">
          <template v-if="character.data.type === 'doll'">
            <icon-btn
              :disable-button="true"
              size="normal"
              :under-text="NechronicaPositionList[character.data.character.basic.position]?.text || ''"
              :class="NechronicaPositionList[character.data.character.basic.position].val || ''"
            />
            <span style="font-size: 11px; line-height: 1.2em">/</span>
            <icon-btn
              :disable-button="true"
              :under-text="NechronicaClassList[character.data.character.basic.mainClass]?.text || ''"
              size="small"
              :class="NechronicaClassList[character.data.character.basic.mainClass].val || ''"
            />
            <template v-if="character.data.character.basic.mainClass !== character.data.character.basic.subClass">
              <span style="font-size: 11px; line-height: 1.2em">/</span>
              <icon-btn
                :disable-button="true"
                :under-text="NechronicaClassList[character.data.character.basic.subClass]?.text || ''"
                size="small"
                :class="NechronicaClassList[character.data.character.basic.subClass].val || ''"
              />
            </template>
            <template v-else>
              <span style="font-size: 11px; line-height: 1.2em">×2</span>
            </template>
          </template>
          <v-spacer />
          <link-btn class="align-self-start" size="default" :href="character.data.character.url" />
        </v-card-text>
        <v-card-text class="text-body-1 ellipsis" style="max-width: 20rem">
          {{ character.data.character.basic.characterName }}
        </v-card-text>
        <v-card-text class="py-1 px-2" v-if="character.data.type === 'doll' || !perspective">
          <reload-character-sheet-btn :character-id="characterId" />
        </v-card-text>
      </v-card>
    </v-menu>
  </template>
</template>

<script setup lang="ts">
import IconBtn from '@/components/panes/Nechronica/maneuver/IconBtn.vue'
import { NechronicaClassList, NechronicaPositionList, NechronicaWrap } from '@/components/panes/Nechronica/nechronica'
import { computed, inject } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ReloadCharacterSheetBtn from '@/components/panes/Nechronica/component/ReloadCharacterSheetBtn.vue'
import VSelectThin from '@/components/panes/Nechronica/component/VSelectThin.vue'
import LinkBtn from '@/components/parts/LinkBtn.vue'

const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  characterId: string
  perspective: string
}>()

const emits = defineEmits<{
  (e: 'update:position', position: number): void
}>()

const character = computed((): { id: string; data: NechronicaWrap } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
})

const positionSelection = [
  { value: '0', text: '' },
  { value: '1', text: '奈落' },
  { value: '2', text: '地獄' },
  { value: '3', text: '煉獄' },
  { value: '4', text: '花園' },
  { value: '5', text: '楽園' }
]

const icon = computed(() => {
  if (!character.value) return ''
  if (character.value?.data.type === 'doll') {
    return NechronicaPositionList[character.value?.data.character.basic.position].val
  }
  return character.value?.data.type
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
