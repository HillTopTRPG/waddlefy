<template>
  <v-card class="d-flex flex-column flex-0-0" style="height: auto" variant="text">
    <v-card-subtitle class="mx-0 pb-0 pl-0 font-weight-bold">対{{ title }}</v-card-subtitle>
    <v-card-item class="py-0 d-inline-flex pr-0">
      <v-sheet class="d-flex flex-row bg-transparent" style="gap: 0.3rem" v-if="mode === 'view'">
        <v-defaults-provider :defaults="{ VChip: { color: 'primary', density: 'comfortable' } }">
          <v-chip text="居所" :variant="locationValue ? 'flat' : 'outlined'" :disabled="!locationValue" />
          <v-menu :disabled="!isPerspectiveSecret" :close-on-content-click="false" scroll-strategy="close">
            <template v-slot:activator="{ props }">
              <v-chip
                text="秘密"
                :variant="secretValue ? 'flat' : 'outlined'"
                :disabled="!secretValue"
                :class="secretValue && isPerspectiveSecret ? 'text-decoration-underline' : ''"
                :ripple="secretValue && isPerspectiveSecret"
                :style="{ cursor: secretValue && isPerspectiveSecret ? 'cursor' : 'default' }"
                v-bind="props"
              />
            </template>
            <v-card class="border" style="max-width: 20rem">
              <v-card-title class="text-pre-wrap">{{ title }}の秘密</v-card-title>
              <v-card-text class="pb-2">
                <v-sheet class="text-pre-wrap text-body-2">{{ targetHandout?.data.secret }}</v-sheet>
              </v-card-text>
            </v-card>
          </v-menu>
          <v-chip
            :text="emotionValue ? emotionList.find(e => e.value === emotionValue)?.label : '感情なし'"
            :disabled="!emotionValue"
            :variant="emotionValue ? 'flat' : 'outlined'"
          />
        </v-defaults-provider>
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
    <template v-if="mode === 'view' && targetCharacter?.data.character.specialArtsList.length">
      <v-sheet class="d-flex flex-row flex-wrap mt-1 pl-4" style="gap: 0.5rem">
        <template v-for="(arts, idx) in targetCharacter?.data.character.specialArtsList || []" :key="arts._id">
          <v-menu
            :disabled="!isPerspectiveSpecialArts(arts._id)"
            :close-on-content-click="false"
            scroll-strategy="close"
          >
            <template v-slot:activator="{ props }">
              <v-chip
                :text="`奥義${idx + 1}`"
                color="primary"
                density="comfortable"
                :variant="isOpenSpecialArts(arts._id) ? 'flat' : 'outlined'"
                :disabled="!isOpenSpecialArts(arts._id)"
                :class="isOpenPerspectiveSA(arts._id) ? 'text-decoration-underline' : ''"
                :ripple="isOpenPerspectiveSA(arts._id)"
                :style="{ cursor: isOpenPerspectiveSA(arts._id) ? 'pointer' : 'default' }"
                v-bind="props"
              />
            </template>
            <special-arts-card :arts="arts" />
          </v-menu>
        </template>
      </v-sheet>
    </template>
    <template v-else>
      <v-card-item
        v-for="arts in targetCharacter?.data.character.specialArtsList || []"
        :key="arts._id"
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
            <special-arts-card :arts="arts" />
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
import SpecialArtsCard from '@/components/panes/Shinobigami/SpecialArtsCard.vue'

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

const isPerspectiveSecret = computed(() => {
  if (!props.perspective) return true
  return (
    graphQlStore?.state.sessionDataList.some(sd => {
      if (sd.type !== 'shinobigami-handout-relation') return false
      if (sd.data.targetId !== targetHandout.value.id) return false
      if (sd.data.type !== 'secret') return false
      const handout = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === sd.data.ownerId)
      if (!handout) return false
      const character = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === handout.data.person)
      if (!character) return false
      return character.data.player === props.perspective
    }) || false
  )
})

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

function isPerspectiveSpecialArts(artsId: string) {
  if (!props.perspective) return true
  return (
    graphQlStore?.state.sessionDataList.some(sd => {
      if (sd.type !== 'shinobigami-handout-relation') return false
      if (sd.data.targetId !== targetHandout.value.id) return false
      if (sd.data.type !== artsId) return false
      const handout = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === sd.data.ownerId)
      if (!handout) return false
      const character = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === handout.data.person)
      if (!character) return false
      return character.data.player === props.perspective
    }) || false
  )
}

function isOpenPerspectiveSA(artsId: string) {
  return isOpenSpecialArts(artsId) && isPerspectiveSpecialArts(artsId)
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
