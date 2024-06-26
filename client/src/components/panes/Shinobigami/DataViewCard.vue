<template>
  <v-card variant="flat" class="overflow-x-auto bg-transparent no-transition surface-text-color">
    <v-card-title class="pt-0 pl-0 pb-0 d-flex align-center flex-row surface-text-color">
      <span class="ml-4 text-h5">{{ scenarioData?.data.name || '' }}</span>
      <template v-if="characterSheet">
        <v-menu :close-on-content-click="false" scroll-strategy="close">
          <template #activator="{ props }">
            <v-btn variant="text" v-bind="props" class="text-h5 px-1 text-decoration-underline">
              {{ characterSheet.characterName }}
            </v-btn>
          </template>
          <basic-info-card :character-sheet="characterSheet" />
        </v-menu>
        <v-defaults-provider :defaults="{ VBtn: { size: 'small', variant: 'flat' } }">
          <v-btn
            icon="mdi-open-in-new"
            class="bg-transparent"
            target="_blank"
            rel="noopener noreferrer"
            :href="characterSheet.url"
          />
        </v-defaults-provider>
        <span class="text-body-2">({{ handoutCharacterPlayerName }})</span>
      </template>
    </v-card-title>
    <v-card-title class="pt-0 d-flex flex-wrap" style="gap: 5px">
      <template v-if="backgroundView && characterSheet">
        <template v-for="(back, idx) in characterSheet.backgroundList" :key="idx">
          <background-chip :text="back.name" :chip="back.effect" :type="back.type" :point="back.point" />
        </template>
      </template>
      <template v-for="prize in prizeList" :key="prize.id">
        <v-menu :close-on-content-click="false">
          <template #activator="{ props }">
            <v-defaults-provider :defaults="{ VChip: { label: true, border: true, elevation: 3 } }">
              <v-chip variant="flat" size="small" color="lime" v-bind="props">
                <v-icon icon="mdi-treasure-chest-outline" class="mr-1" />
                <span>{{ prize.data.name }}</span>
              </v-chip>
            </v-defaults-provider>
          </template>
          <prize-chip :prize="prize.data" :perspective="perspective" />
        </v-menu>
      </template>
    </v-card-title>
    <v-card-text class="py-0">
      <v-sheet class="w-100 d-flex flex-wrap bg-transparent" style="gap: 5px">
        <v-sheet class="bg-transparent" v-if="tokugiView && characterSheet">
          <speciality-table
            class="mb-2"
            :select-skill="selectSkill"
            @update:select-skill="v => emits('update:select-skill', v)"
            v-model:editing="tokugiTableEditing"
            :info="computedSkills"
            :perspective="perspective"
            @update:info="v => updateInfo(v)"
            :editable="true"
          />
        </v-sheet>
        <v-sheet class="bg-transparent" v-if="characterSheet && (ninpouView || specialArtsView)">
          <ninpou-table
            v-if="ninpouView"
            class="mb-2"
            :select-skill="selectSkill"
            :list="characterSheet.ninjaArtsList"
            :perspective="perspective"
            @click-skill="v => emits('update:select-skill', v === selectSkill ? '' : v)"
          />
          <special-arts-table
            v-if="specialArtsView"
            class="mb-2"
            :select-skill="selectSkill"
            :owner-id="handoutId || ''"
            :list="characterSheet.specialArtsList"
            :perspective="perspective"
            @click-skill="v => emits('update:select-skill', v === selectSkill ? '' : v)"
          />
        </v-sheet>
        <v-sheet class="bg-transparent" v-if="textView && handoutId">
          <data-view-card-tab-container
            class="mb-2"
            :handout-id="handoutId"
            :perspective="perspective"
            :text-rows="textRows"
          />
        </v-sheet>
      </v-sheet>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { Layout } from '@/components/panes'
import { SaikoroFictionTokugi } from '@/components/panes/SaikoroFiction'
import BackgroundChip from '@/components/panes/Shinobigami/BackgroundChip.vue'
import NinpouTable from '@/components/panes/Shinobigami/NinpouTable.vue'
import { ShinobiGami } from '@/components/panes/Shinobigami/shinobigami'
import SpecialityTable from '@/components/panes/Shinobigami/SpecialityTable.vue'
import { computed, inject, ref, watch } from 'vue'

import { clone } from '@/components/panes/PrimaryDataUtility'
import DataViewCardTabContainer from '@/components/panes/Shinobigami/DataViewCardTabContainer.vue'
import SpecialArtsTable from '@/components/panes/Shinobigami/SpecialArtsTable.vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import BasicInfoCard from '@/components/panes/Shinobigami/BasicInfoCard.vue'
import PrizeChip from '@/components/panes/Shinobigami/PrizeChip.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  characterId?: string
  scenarioDataId: string
  selectSkill: string
  backgroundView: boolean
  ninpouView: boolean
  specialArtsView: boolean
  tokugiView: boolean
  textView: boolean
  textRows: number
  perspective: string
}>()

const scenarioData = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.scenarioDataId)
})

const handoutCharacterPlayerName = computed(() => {
  if (character.value?.data.player === 'user') return '主催者'
  if (player.value?.id === props.perspective) return 'あなた'
  return player.value?.name || 'PL割当なし'
})

const character = computed(() => {
  if (props.characterId) {
    return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
  } else if (props.scenarioDataId && scenarioData.value?.type === 'shinobigami-handout') {
    return graphQlStore?.state.sessionDataList.find(sd => sd.id === scenarioData.value?.data.person)
  }
  return undefined
})

const prizeList = computed(() => {
  function judgeWrap(ownerId: string) {
    return (
      graphQlStore?.state.sessionDataList.filter(sd => {
        if (sd.type !== 'shinobigami-prize') return false
        if (sd.data.owner !== ownerId) return false
        if (!props.perspective) return true
        return sd.data.readableList.some((r: string) => {
          const readableHandout = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === r)
          if (!readableHandout) return false
          const readableCharacter = graphQlStore?.state.sessionDataList.find(
            sdc => sdc.id === readableHandout.data.person
          )
          return readableCharacter?.data.player === props.perspective
        })
      }) || []
    )
  }
  if (props.characterId) {
    return judgeWrap(characterHandout.value?.id || '')
  } else if (props.scenarioDataId && scenarioData.value?.type === 'shinobigami-handout') {
    return judgeWrap(props.scenarioDataId)
  }
  return []
})

const characterSheet = computed(() => character.value?.data.character as ShinobiGami | undefined)
const computedSkills = computed(() => clone(characterSheet.value?.skill) || undefined)

const characterHandout = computed(() =>
  graphQlStore?.state.sessionDataList.find(
    sd => sd.type === 'shinobigami-handout' && sd.data?.person === props.characterId
  )
)

const handoutId = computed(() => props.scenarioDataId || characterHandout.value?.id)

const player = computed(() => graphQlStore?.state.players.find(p => p.id === character.value?.data.player))

const emits = defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
  (e: 'update:select-skill', selectSkill: string): void
}>()

const navigationDrawer = ref(false)
watch(navigationDrawer, v => {
  if (v) {
    emits('update:select-skill', '')
  }
})

const tokugiTableEditing = ref(false)

async function updateInfo(info: SaikoroFictionTokugi) {
  if (!graphQlStore || !character.value) return
  const characterSheetClone = clone(characterSheet.value)!
  characterSheetClone.skill = info
  await graphQlStore.updateShinobigamiCharacter(
    character.value.id || '',
    character.value.data.player,
    character.value.data.viewPass || '',
    characterSheetClone
  )
}
</script>

<style lang="scss" scoped></style>
