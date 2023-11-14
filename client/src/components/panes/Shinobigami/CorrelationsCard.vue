<template>
  <v-card class="d-flex flex-column flex-0-0" style="height: auto" variant="text">
    <v-card-subtitle class="mx-0 pb-0 font-weight-bold">対{{ title }}</v-card-subtitle>
    <v-card-item class="py-0 d-inline-flex pr-0">
      <v-sheet class="d-flex flex-row bg-transparent" style="gap: 0.3rem" v-if="mode === 'view'">
        <v-chip
          text="居所"
          color="primary"
          density="comfortable"
          :variant="locationValue ? 'flat' : 'outlined'"
          :disabled="!locationValue"
        />
        <v-chip
          text="秘密"
          color="primary"
          density="comfortable"
          :variant="secretValue ? 'flat' : 'outlined'"
          :disabled="!secretValue"
        />
        <v-chip
          :text="emotionValue ? emotionList.find(e => e.value === emotionValue)?.label : '感情なし'"
          color="primary"
          density="comfortable"
          :disabled="!emotionValue"
          :variant="emotionValue ? 'flat' : 'outlined'"
        />
      </v-sheet>
      <v-card class="d-flex flex-row ma-0 border" variant="text" :flat="true" rounded="lg" v-if="mode === 'edit'">
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
          <v-card-item class="bg-white">
            <v-checkbox-btn
              class="flex-column-reverse align-stretch"
              :model-value="locationValue"
              @update:model-value="onUpdateRelationFlag('location')"
            >
              <template v-slot:label>
                <span class="text-body-2 pt-2 w-100 text-center">居所</span>
              </template>
            </v-checkbox-btn>
          </v-card-item>
          <v-divider :vertical="true" />
          <v-card-item :class="perspective ? '' : 'bg-white'">
            <v-checkbox-btn
              class="flex-column-reverse align-stretch"
              :readonly="Boolean(perspective)"
              :model-value="secretValue"
              @update:model-value="onUpdateRelationFlag('secret')"
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
              :model-value="emotionValue || ''"
              @update:model-value="v => onUpdateRelationEmotion(v)"
            >
              <template v-slot:label>
                <span class="text-body-2" style="margin-top: 1px">感情</span>
              </template>
            </v-select>
          </v-card-item>
        </v-defaults-provider>
      </v-card>
    </v-card-item>
    <template v-if="mode === 'edit'">
      <v-card-item
        v-for="(arts, idx) in targetCharacter?.data.character.specialArtsList || []"
        :key="idx"
        class="py-0 pr-0"
      >
        <v-sheet class="bg-transparent d-flex flex-row align-center justify-start mt-1" style="gap: 0.3rem">
          <v-checkbox-btn
            class="card-item-check mr-0 flex-0-0"
            :class="mode === 'view' || Boolean(perspective) ? 'readonly' : ''"
            :readonly="mode === 'view' || Boolean(perspective)"
            :model-value="isOpenSpecialArts(arts._id)"
            @update:model-value="onUpdateRelationFlag(arts._id)"
          >
            <template v-slot:label>
              <span>奥義情報</span>
            </template>
          </v-checkbox-btn>
          <v-menu
            :close-on-content-click="false"
            location="top left"
            scroll-strategy="close"
            location-strategy="connected"
            v-if="
              !perspective ||
              targetCharacter.data.player === perspective ||
              (isOpenSpecialArts(arts.id) && ownerCharacter.data.player === perspective)
            "
          >
            <template v-slot:activator="{ props }">
              <v-btn
                variant="text"
                max-width="13em"
                class="text-decoration-underline px-2 overflow-x-hidden justify-start"
                v-bind="props"
              >
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
                <v-card-item>
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
              </v-defaults-provider>
            </v-card>
          </v-menu>
        </v-sheet>
      </v-card-item>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

import { ShinobigamiEmotion } from '@/components/panes/Shinobigami/shinobigami'
import { omit } from 'lodash'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import { SessionData } from '@/components/graphql/schema'

const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  ownerId: string
  targetId: string
  mode: 'edit' | 'view'
  perspective: string
}>()

const ownerHandout = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.ownerId)
})

const targetHandout = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.targetId)
})

const ownerCharacter = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === ownerHandout.value.data.person)
})

const targetCharacter = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === targetHandout.value.data.person)
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

const title = computed(() => {
  if (!targetCharacter.value) return targetHandout.value?.data.name || ''
  const player = graphQlStore?.state.players.find(p => p.id === targetCharacter.value.data.player)
  const playerName = player?.id === props.perspective ? 'あなた' : player?.name
  const characterName = targetCharacter.value.data.character.characterName
  const afterName = playerName ? `${characterName}(${playerName})` : characterName
  return `${targetHandout.value.data.name} : ${afterName}`
})

function matchRelationType(judge: (sd: SessionData) => boolean) {
  return (
    graphQlStore?.state.sessionDataList.find(sd => {
      if (sd.type !== 'shinobigami-handout-relation') return false
      if (sd.data.ownerId !== ownerHandout.value.id) return false
      if (sd.data.targetId !== targetHandout.value.id) return false
      return judge(sd)
    })?.data.type || ''
  )
}

const locationValue = computed(() => Boolean(matchRelationType(sd => sd.data.type === 'location')))
const secretValue = computed(() => Boolean(matchRelationType(sd => sd.data.type === 'secret')))
const emotionValue = computed(() => matchRelationType(sd => typeof sd.data.type === 'number'))

function isOpenSpecialArts(artsId: string) {
  return (
    graphQlStore?.state.sessionDataList.some(sd => {
      if (sd.type !== 'shinobigami-handout-relation') return false
      if (sd.data.ownerId !== ownerHandout.value.id) return false
      if (sd.data.targetId !== targetHandout.value.id) return false
      return sd.data.type === artsId
    }) || false
  )
}

async function onUpdateRelationFlag(type: 'location' | 'secret' | string) {
  const ownerId = ownerHandout.value.id
  const targetId = targetHandout.value.id
  const findStr = JSON.stringify({ ownerId, targetId, type })

  const relation = graphQlStore?.state.sessionDataList.find(sd => {
    if (sd.type !== 'shinobigami-handout-relation') return false
    return JSON.stringify(omit(sd.data, ['id'])) === findStr
  })
  if (relation) {
    await graphQlStore?.deleteSessionData(relation.id)
  } else {
    await graphQlStore?.addShinobigamiHandoutRelation(ownerId, targetId, type)
  }
}

async function onUpdateRelationEmotion(emotionValue: ShinobigamiEmotion | '') {
  const ownerId = ownerHandout.value.id
  const targetId = targetHandout.value.id

  const relation = graphQlStore?.state.sessionDataList.find(sd => {
    if (sd.type !== 'shinobigami-handout-relation') return false
    if (sd.data.ownerId !== ownerId) return false
    return sd.data.targetId === targetId && typeof sd.data.type === 'number'
  })
  if (relation) {
    if (emotionValue === '') {
      await graphQlStore?.deleteSessionData(relation.id)
    } else {
      await graphQlStore?.updateShinobigamiHandoutRelation(relation.id, ownerId, targetId, emotionValue)
    }
  } else {
    await graphQlStore?.addShinobigamiHandoutRelation(ownerId, targetId, emotionValue)
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

:deep(button) {
  .v-btn__content {
    overflow-x: hidden;
  }
}
</style>
