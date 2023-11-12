<template>
  <v-card
    v-for="handout in graphQlStore?.state.sessionDataList.filter(
      sd => sd.type === 'shinobigami-handout' && sd.id !== dataObj.id
    )"
    :key="handout.id"
    class="d-flex flex-column"
    variant="text"
  >
    <v-card-subtitle class="mx-0 pb-0 font-weight-bold">対{{ getHandoutName(handout) }}</v-card-subtitle>
    <v-card-item class="py-0 d-inline-flex">
      <v-card class="d-flex flex-row ma-0 border" :flat="true" rounded="lg">
        <v-defaults-provider
          :defaults="{
            VCardItem: { class: 'pa-0' },
            VCheckBoxBtn: { density: 'compact' },
            VSelect: {
              persistentPlaceholder: true,
              persistentHint: true,
              variant: 'solo',
              hideDetails: true,
              rounded: 0,
              flat: true
            }
          }"
        >
          <v-card-item>
            <v-checkbox-btn
              class="flex-column-reverse align-stretch"
              :model-value="
                graphQlStore?.state.sessionDataList.some(
                  sd =>
                    sd.type === 'shinobigami-handout-relation' &&
                    sd.data.ownerId === dataObj.id &&
                    sd.data.targetId === handout.id &&
                    sd.data.type === 'location'
                )
              "
              @update:model-value="onUpdateShinobigamiHandoutRelation(handout.id, 'location')"
            >
              <template v-slot:label>
                <span class="text-body-2 pt-2 w-100 text-center">居所</span>
              </template>
            </v-checkbox-btn>
          </v-card-item>
          <v-divider :vertical="true" />
          <v-card-item>
            <v-checkbox-btn
              class="flex-column-reverse align-stretch"
              :model-value="
                graphQlStore?.state.sessionDataList.some(
                  sd =>
                    sd.type === 'shinobigami-handout-relation' &&
                    sd.data.ownerId === dataObj.id &&
                    sd.data.targetId === handout.id &&
                    sd.data.type === 'secret'
                )
              "
              @update:model-value="onUpdateShinobigamiHandoutRelation(handout.id, 'secret')"
            >
              <template v-slot:label>
                <span class="text-body-2 pt-2 w-100 text-center">秘密</span>
              </template>
            </v-checkbox-btn>
          </v-card-item>
          <v-divider :vertical="true" />
          <v-card-item class="flex-0-1-100">
            <v-select
              class="emotion-select"
              :items="emotionList"
              item-title="label"
              item-value="value"
              :model-value="
                graphQlStore?.state.sessionDataList.find(
                  sd =>
                    sd.type === 'shinobigami-handout-relation' &&
                    sd.data.ownerId === dataObj.id &&
                    sd.data.targetId === handout.id &&
                    !isFixType(sd.data.type)
                )?.data.type || ''
              "
              @update:model-value="v => onUpdateShinobigamiHandoutRelation(handout.id, v)"
            >
              <template v-slot:label>
                <span class="text-body-2" style="margin-top: 1px">感情</span>
              </template>
            </v-select>
          </v-card-item>
        </v-defaults-provider>
      </v-card>
    </v-card-item>
    <v-card-item
      v-for="(arts, idx) in graphQlStore?.state.sessionDataList.find(sd => sd.id === handout.data.person)?.data
        .character.specialArtsList || []"
      :key="idx"
      class="py-0 pr-0"
    >
      <v-sheet class="bg-transparent d-flex flex-row align-center justify-start">
        <v-checkbox-btn class="mr-0 flex-0-0">
          <template v-slot:label>
            <div>
              <span>奥義情報</span>
            </div>
          </template>
        </v-checkbox-btn>
        <v-menu
          :close-on-content-click="false"
          location="top left"
          scroll-strategy="close"
          location-strategy="connected"
        >
          <template v-slot:activator="{ props }">
            <v-btn variant="text" class="text-decoration-underline px-2" v-bind="props">
              <template v-slot:default>
                <div style="max-width: 13em; white-space: nowrap; overflow-x: hidden; text-overflow: ellipsis">
                  {{ arts.name }}
                </div>
              </template>
            </v-btn>
          </template>
          <v-card max-width="20em">
            <v-defaults-provider
              :defaults="{
                VTextField: {
                  readonly: true,
                  variant: 'solo-filled',
                  hideDetails: true,
                  noResize: true,
                  flat: true
                },
                VTextarea: {
                  readonly: true,
                  variant: 'solo-filled',
                  hideDetails: true,
                  noResize: true,
                  flat: true
                }
              }"
            >
              <v-card-title class="overflow-x-auto text-wrap text-break" style="line-height: 1.3em">{{
                arts.name
              }}</v-card-title>
              <v-card-item class="py-0">
                <v-sheet class="d-flex flex-column" style="gap: 0.5rem">
                  <v-text-field label="指定特技" :model-value="arts.skill" />
                  <v-textarea
                    label="効果／強み／弱み"
                    :auto-grow="true"
                    :rows="1"
                    :max-rows="10"
                    :model-value="arts.effect"
                  />
                  <v-textarea label="演出" :auto-grow="true" :rows="1" :max-rows="5" :model-value="arts.direction" />
                </v-sheet>
              </v-card-item>
              <v-card-actions class="px-4">
                <v-spacer />
                <v-btn variant="text" class="text-decoration-underline">閉じる</v-btn>
              </v-card-actions>
            </v-defaults-provider>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

import { ShinobigamiEmotion } from '@/components/panes/Shinobigami/shinobigami'
import { omit } from 'lodash'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  dataId: string
}>()

const dataObj = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.dataId)
})

const emotionList = [
  { value: '', label: 'なし' },
  { value: -6, label: '殺意(-6)' },
  { value: -5, label: '劣等感(-5)' },
  { value: -4, label: '侮蔑(-4)' },
  { value: -3, label: '妬み(-3)' },
  { value: -2, label: '怒り(-2)' },
  { value: -1, label: '不審(-1)' },
  { value: 1, label: '共感(1)' },
  { value: 2, label: '友情(2)' },
  { value: 3, label: '愛情(3)' },
  { value: 4, label: '忠誠(4)' },
  { value: 5, label: '憧憬(5)' },
  { value: 6, label: '狂信(6)' }
]

function getHandoutName(handout: { data: { name: string; person: string } }): string {
  const character = graphQlStore?.state.sessionDataList.find(sd => sd.id === handout.data.person)
  if (!character) return handout.data.name
  const player = graphQlStore?.state.players.find(p => p.id === character.data.player)
  const afterName = player
    ? `${character.data.character.characterName}(${player.name})`
    : character.data.character.characterName
  return `${handout.data.name} : ${afterName}`
}

function isFixType(type: 'location' | 'secret' | ShinobigamiEmotion) {
  return ['location', 'secret'].some(t => t === type)
}

async function onUpdateShinobigamiHandoutRelation(targetId: string, type: 'location' | 'secret' | ShinobigamiEmotion) {
  const ownerId = dataObj.value.id
  const findStr = JSON.stringify({ ownerId, targetId, type })

  if (isFixType(type)) {
    const relation = graphQlStore?.state.sessionDataList.find(sd => {
      if (sd.type !== 'shinobigami-handout-relation') return
      return JSON.stringify(omit(sd.data, ['id'])) === findStr
    })
    if (relation) {
      await graphQlStore?.deleteSessionData(relation.id)
    } else {
      await graphQlStore?.addShinobigamiHandoutRelation(ownerId, targetId, type)
    }
  } else {
    const relation = graphQlStore?.state.sessionDataList.find(
      sd =>
        sd.type === 'shinobigami-handout-relation' &&
        sd.data.ownerId === ownerId &&
        sd.data.targetId === targetId &&
        !isFixType(sd.data.type)
    )
    if (relation) {
      await graphQlStore?.updateShinobigamiHandoutRelation(relation.id, ownerId, targetId, type)
    } else {
      await graphQlStore?.addShinobigamiHandoutRelation(ownerId, targetId, type)
    }
  }
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.emotion-select {
  width: 9em;
  height: 4.2em;
  grid-template-areas: 'prepend control append';
  grid-template-rows: auto;
  :deep(.v-field__input) {
    padding-top: 33px !important;
  }
}
</style>
