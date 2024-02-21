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
                class="ellipsis text-h6 text-decoration-underline position-relative overflow-y-hidden bg-transparent"
                style="width: 1em; flex-grow: 1"
              >
                {{ character.data.character.basic.characterName }}
              </v-sheet>
            </v-sheet>
            <v-select-thin
              :prefix="$t('Nechronica.label.placement')"
              style="max-width: 8em"
              :items="mapping.CHARACTER_LOCATION.map(d => ({ value: d['pos-value'], text: $t(d.text) }))"
              :model-value="character?.data.position.toString() || '0'"
              @update:model-value="v => emits('update:position', parseInt(v, 10))"
            />
          </v-sheet>
        </v-sheet>
      </template>
      <v-card class="pb-1" max-width="20rem">
        <v-card-text class="py-2 d-flex flex-row align-end">
          <template v-if="isDoll">
            <icon-btn
              :disable-button="true"
              size="normal"
              :under-text="mapping.CHARACTER_POSITION[character.data.character.basic.position]?.text || ''"
              :class="mapping.CHARACTER_POSITION[character.data.character.basic.position].val || ''"
            />
            <span style="font-size: 11px; line-height: 1.2em">/</span>
            <icon-btn
              :disable-button="true"
              :under-text="mapping.CHARACTER_CLASS[character.data.character.basic.mainClass]?.text || ''"
              size="small"
              :class="mapping.CHARACTER_CLASS[character.data.character.basic.mainClass].val || ''"
            />
            <template v-if="character.data.character.basic.mainClass !== character.data.character.basic.subClass">
              <span style="font-size: 11px; line-height: 1.2em">/</span>
              <icon-btn
                :disable-button="true"
                :under-text="mapping.CHARACTER_CLASS[character.data.character.basic.subClass]?.text || ''"
                size="small"
                :class="mapping.CHARACTER_CLASS[character.data.character.basic.subClass].val || ''"
              />
            </template>
            <template v-else>
              <span style="font-size: 11px; line-height: 1.2em">×2</span>
            </template>
          </template>
          <template v-else>
            <icon-btn
              :disable-button="true"
              size="normal"
              :under-text="$t(`Nechronica.CHARACTER_TYPE.${character.data.type}`)"
              :class="`type-${character.data.type}`"
            />
          </template>
          <v-spacer />
          <link-btn class="align-self-start" size="small" :href="character.data.character.url" />
        </v-card-text>
        <v-card-text class="d-flex flex-row align-center py-0">
          <span class="text-body-1 ellipsis" :style="`max-width: ${isDoll ? 20 : 18}rem`">{{
            character.data.character.basic.characterName
          }}</span>
        </v-card-text>
        <v-card-text v-if="isDoll" class="d-flex flex-column align-start py-0">
          <table class="basic-info-table">
            <tr>
              <th>{{ $t('Nechronica.label.shuzoku') }}</th>
              <td>{{ character?.data.character.basic.shuzoku || '' }}</td>
            </tr>
            <tr>
              <th>{{ $t('Nechronica.label.age') }}</th>
              <td>{{ character?.data.character.basic.age || '' }}</td>
            </tr>
            <tr>
              <th>{{ $t('Nechronica.label.init-placement') }}</th>
              <td>{{ basePositionText }}</td>
            </tr>
            <tr>
              <th>{{ $t('Nechronica.label.height') }}</th>
              <td>{{ character?.data.character.basic.height || '' }}</td>
            </tr>
            <tr>
              <th>{{ $t('Nechronica.label.weight') }}</th>
              <td>{{ character?.data.character.basic.weight || '' }}</td>
            </tr>
            <tr>
              <th>{{ $t('Nechronica.label.carma') }}</th>
              <td>{{ character?.data.character.basic.carma || '' }}</td>
            </tr>
            <tr>
              <th>{{ $t('Nechronica.label.hair-color') }}</th>
              <td>{{ character?.data.character.basic.hairColor || '' }}</td>
            </tr>
            <tr>
              <th>{{ $t('Nechronica.label.eye-color') }}</th>
              <td>{{ character?.data.character.basic.eyeColor || '' }}</td>
            </tr>
            <tr>
              <th>{{ $t('Nechronica.label.skin-color') }}</th>
              <td>{{ character?.data.character.basic.skinColor || '' }}</td>
            </tr>
          </table>
        </v-card-text>
        <v-card-text class="py-1 px-2" v-if="character.data.type === 'doll' || !perspective">
          <reload-character-sheet-btn :character-id="characterId" />
        </v-card-text>
        <v-card-text class="pt-0 pb-1 px-2" v-if="!perspective">
          <add-unknown-maneuver-btn @execute="onAddUnknownManeuver()" />
        </v-card-text>
      </v-card>
    </v-menu>
  </template>
</template>

<script setup lang="ts">
import IconBtn from '@/components/panes/Nechronica/maneuver/IconBtn.vue'
import mapping from '@/components/panes/Nechronica/mapping.json'
import { NechronicaManeuver, NechronicaWrap } from '@/components/panes/Nechronica/nechronica'
import { computed, inject } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ReloadCharacterSheetBtn from '@/components/panes/Nechronica/component/ReloadCharacterSheetBtn.vue'
import VSelectThin from '@/components/panes/Nechronica/component/VSelectThin.vue'
import AddUnknownManeuverBtn from '@/components/panes/Nechronica/maneuver/AddUnknownManeuverBtn.vue'
import LinkBtn from '@/components/parts/LinkBtn.vue'
import { useI18n } from 'vue-i18n'

const graphQlStore = inject<GraphQlStore>(GraphQlKey)

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

const isDoll = computed(() => character.value?.data.type === 'doll')

const icon = computed(() => {
  if (!character.value) return ''
  if (character.value?.data.type === 'doll') {
    return mapping.CHARACTER_POSITION[character.value?.data.character.basic.position].val
  }
  return `type-${character.value?.data.type}`
})

const { t } = useI18n()

const basePositionText = computed((): string => {
  const basePosition = character.value?.data.character.basic.basePosition.toString(10) || '0'
  const contentRaw = mapping.CHARACTER_LOCATION.find((cp: any) => cp['init-pos-value'] === basePosition)?.text || ''
  return t(contentRaw)
})

async function onAddUnknownManeuver() {
  await graphQlStore?.updateNechronicaCharacterHelper(props.characterId, c => {
    const newManeuver: NechronicaManeuver = {
      lost: false,
      used: false,
      type: 0,
      parts: 0,
      name: `マニューバ${c.character.maneuverList.length + 1}`,
      timing: 0,
      cost: '',
      range: '',
      memo: '',
      shozoku: '',
      ignoreBravado: false,
      isBravado: false,
      isUnknown: true,
      isAdded: true
    }
    c.character.maneuverList.push(newManeuver)
  })
}
</script>

<style lang="scss" scoped>
.basic-info-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;

  tr:nth-child(odd) {
    background-color: #eee;
  }

  th {
    background-color: #aaaaaa22;
    text-align: center;
    min-width: 4rem;
    max-width: 4rem;
    width: 4rem;
    height: 1.5rem;
  }

  td {
    text-align: center;
    overflow: hidden;
  }
}
</style>
