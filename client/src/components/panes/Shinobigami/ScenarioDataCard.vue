<template>
  <v-card
    v-if="dataObj && (dataObj.type !== 'shinobigami-prize' || !perspective || prizeKnow)"
    :color="typeList.find(t => t.value === dataObj.type)?.color || ''"
    class="ml-3 mb-3 border elevation-4"
    rounded="lg"
  >
    <v-card-title class="ma-0 py-2" color="red">
      <v-icon :icon="typeList.find(t => t.value === dataObj.type)?.icon(dataObj.data)" class="mr-1" />
      <span>{{ typeList.find(t => t.value === dataObj.type)?.label || '' }}</span>
    </v-card-title>
    <v-card-item class="pa-0">
      <v-sheet class="d-flex flex-column align-self-start px-2 pb-2 bg-transparent" style="gap: 0.5rem">
        <template v-if="dataObj.type === 'shinobigami-character'">
          <reload-character-sheet-button :character-id="dataObj.id" />
          <menu-edit-text-field
            label="名前"
            icon="mdi-tag-outline"
            placeholder="未設定"
            :width="20"
            :text="dataObj.data.character.characterName"
            :editable="true"
            @update="onUpdateCharacterName"
          />
          <v-select
            :items="hasEmptyPlayers"
            item-value="id"
            item-title="name"
            variant="solo"
            :flat="true"
            label="参加者"
            class="align-self-start"
            :hide-details="true"
            style="width: 20rem; max-width: 20rem"
            :persistent-placeholder="true"
            :model-value="dataObjPlayerId"
            @update:model-value="v => onUpdateCharacterPlayer(v)"
          >
            <template #label="{ label }">
              <v-icon icon="mdi-relation-one-to-one" class="mr-1" />
              {{ label }}
            </template>
          </v-select>
          <add-special-arts-button
            button-text="奥義を追加"
            classText="align-self-start"
            button-icon="mdi-plus"
            confirm-text="追加"
            @submit="onAddSpecialArts"
          />
          <v-card
            v-for="(arts, idx) in dataObj?.data.character.specialArtsList"
            :key="idx"
            variant="text"
            class="d-flex flex-column"
          >
            <v-card-subtitle class="mx-0 pb-0 font-weight-bold">
              <v-icon icon="mdi-khanda" />
              奥義 ({{ idx + 1 }})
            </v-card-subtitle>
            <v-card-item class="pa-0">
              <v-sheet class="d-flex flex-column align-self-start pl-4 pr-0 bg-transparent" style="gap: 0.5rem">
                <menu-edit-text-field
                  :editable="true"
                  icon="mdi-khanda"
                  :width="19"
                  label="奥義名"
                  :text="arts.name || ''"
                  @update="v => onUpdateSpecialArtsName(idx, v)"
                />
                <tokugi-selector
                  label="指定特技"
                  :width="19"
                  icon="mdi-cards-spade"
                  :value="arts.skill"
                  :editable="true"
                  @update="v => onUpdateSpecialArtsSkill(idx, v)"
                />
                <menu-edit-text-area
                  title="効果／強み／弱み"
                  :editable="true"
                  icon="mdi-script-text-outline"
                  :width="19"
                  :text-rows="5"
                  variant="solo"
                  label="効果／強み／弱み"
                  placeholder=""
                  :text="arts.effect || ''"
                  @update="v => onUpdateSpecialArtsEffect(idx, v)"
                />
                <menu-edit-text-area
                  title="演出"
                  :editable="true"
                  icon="mdi-format-quote-close"
                  :width="19"
                  :text-rows="5"
                  variant="solo"
                  label="演出"
                  placeholder=""
                  :text="arts.direction || ''"
                  @update="v => onUpdateSpecialArtsDirection(idx, v)"
                />
                <delete-menu-btn
                  class-text="align-self-end"
                  :target-name="arts.name"
                  :session-id="graphQlStore?.state.session.id || ''"
                  type="奥義"
                  @execute="onDeleteSpecialArts(idx)"
                />
              </v-sheet>
            </v-card-item>
          </v-card>
        </template>
        <template v-if="dataObj.type === 'shinobigami-handout'">
          <v-checkbox-btn
            label="存在の公開"
            class="card-item-check"
            v-if="editable"
            :model-value="dataObj.data.published"
            @update:model-value="v => onUpdateHandoutPublished(v)"
          />
          <menu-edit-text-field
            label="名前"
            icon="mdi-tag-outline"
            placeholder="未設定"
            :variant="editable ? 'solo' : 'outlined'"
            :class-text="editable ? '' : 'mt-2'"
            :width="20"
            :text="dataObj.data.name"
            :editable="editable"
            @update="onUpdateHandoutName"
          />
          <menu-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の導入の編集`"
            label="導入"
            placeholder="未設定"
            :editable="editable"
            icon="mdi-message-text-outline"
            :variant="editable ? 'solo' : 'outlined'"
            :textarea-class="editable ? '' : 'mt-2'"
            :text-rows="textRows"
            :text="dataObj.data.intro"
            :offset="-textRows * 24 + 18"
            @update="onUpdateHandoutIntro"
          />
          <menu-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の使命の編集`"
            label="使命"
            placeholder="未設定"
            :editable="editable"
            icon="mdi-bullseye"
            :variant="editable ? 'solo' : 'outlined'"
            :textarea-class="editable ? '' : 'mt-2'"
            :text-rows="textRows"
            :text="dataObj.data.objective"
            :offset="-textRows * 24 + 18"
            @update="onUpdateHandoutObjective"
          />
          <menu-edit-text-area
            v-if="handoutSecretOpen"
            :title="`${dataObj.data.name || 'ななし'}の秘密の編集`"
            label="秘密"
            placeholder="未設定"
            :editable="editable"
            icon="mdi-lock-outline"
            :variant="editable ? 'solo' : 'outlined'"
            :textarea-class="editable ? '' : 'mt-2'"
            :text-rows="textRows"
            :text="dataObj.data.secret"
            :offset="-textRows * 24 + 18"
            @update="onUpdateHandoutSecret"
          />
          <v-checkbox-btn
            label="自身の秘密を知っている"
            class="card-item-check"
            :class="editable ? '' : 'readonly'"
            :readonly="!editable"
            :model-value="dataObj.data.knowSelfSecret"
            @update:model-value="v => onUpdateHandoutKnowSelfSecret(v)"
          />
          <v-select
            :items="hasEmptyCharacterList"
            item-value="id"
            item-title="name"
            :variant="editable ? 'solo' : 'outlined'"
            :flat="true"
            label="担当キャラ"
            class="align-self-start"
            :readonly="!editable"
            :hide-details="true"
            style="width: 20rem; max-width: 20rem"
            :persistent-placeholder="true"
            :model-value="dataObjPerson"
            @update:model-value="v => onUpdateHandoutPerson(v)"
          >
            <template #label="{ label }">
              <v-icon icon="mdi-relation-one-to-one" class="mr-1" />
              {{ label }}
            </template>
          </v-select>
          <template v-for="otherHandout in otherHandouts" :key="otherHandout.id">
            <correlations-card
              :mode="mode"
              :owner-id="dataObj.id"
              :target-id="otherHandout.id"
              :perspective="perspective"
            />
          </template>
        </template>
        <template v-if="dataObj.type === 'shinobigami-enigma'">
          <menu-edit-text-field
            label="名前"
            icon="mdi-tag-outline"
            placeholder="未設定"
            :width="20"
            :text="dataObj.data.name"
            :editable="editable"
            :variant="editable ? 'solo' : 'outlined'"
            :class-text="editable ? '' : 'mt-2'"
            @update="onUpdateEnigmaName"
          />
          <menu-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の偽装の編集`"
            label="偽装"
            placeholder="未設定"
            :editable="editable"
            :variant="editable ? 'solo' : 'outlined'"
            :textarea-class="editable ? '' : 'mt-2'"
            icon="mdi-emoticon-cool-outline"
            :text-rows="textRows"
            :text="dataObj.data.camouflage"
            :offset="-textRows * 24 + 18"
            @update="onUpdateEnigmaCamouflage"
          />
          <template v-if="editable || dataObj.data.used">
            <menu-edit-text-field
              label="戦力の名称"
              icon="mdi-skull-crossbones-outline"
              placeholder="未設定"
              :width="20"
              :text="dataObj.data.entityName"
              :editable="editable"
              :variant="editable ? 'solo' : 'outlined'"
              :class-text="editable ? '' : 'mt-2'"
              @update="onUpdateEnigmaEntityName"
            />
            <v-sheet class="d-flex flex-row flex-wrap bg-transparent" style="gap: 0.5rem">
              <v-select
                :items="[1, 2, 3, 4, 5]"
                label="脅威度"
                :readonly="!editable"
                :variant="editable ? 'solo' : 'outlined'"
                :class="editable ? '' : 'mt-2'"
                :flat="true"
                class="align-self-start"
                :hide-details="true"
                :persistent-placeholder="true"
                style="min-width: 6.5em; max-width: 6.5em; gap: 0"
                :model-value="dataObj.data.threat"
                @update:model-value="v => onUpdateEnigmaThreat(v)"
              >
                <template #label="{ label }">
                  <v-icon icon="mdi-altimeter" class="mr-1" />
                  {{ label }}
                </template>
              </v-select>
              <menu-edit-text-field
                label="解除条件"
                icon="mdi-hammer"
                placeholder="未設定"
                :width="13"
                :editable="editable"
                :variant="editable ? 'solo' : 'outlined'"
                :class-text="editable ? '' : 'mt-2'"
                :text="dataObj.data.disableJudgement"
                @update="onUpdateEnigmaDisableJudgement"
              />
            </v-sheet>
            <menu-edit-text-area
              :title="`${dataObj.data.name || 'ななし'}の効果の編集`"
              label="効果"
              placeholder="未設定"
              :editable="editable"
              :variant="editable ? 'solo' : 'outlined'"
              :textarea-class="editable ? '' : 'mt-2'"
              icon="mdi-bomb"
              :text-rows="textRows"
              :text="dataObj.data.effect"
              :offset="-textRows * 24 + 18"
              @update="onUpdateEnigmaEffect"
            />
            <v-select
              :items="hasEmptyHandoutList"
              item-value="id"
              item-title="name"
              :flat="true"
              label="バインド"
              class="align-self-start"
              :hide-details="true"
              :readonly="!editable"
              :variant="editable ? 'solo' : 'outlined'"
              :class="editable ? '' : 'mt-2'"
              style="width: 20rem; max-width: 20rem"
              :persistent-placeholder="true"
              :model-value="dataObj.data.bind"
              @update:model-value="v => onUpdateEnigmaBind(v)"
            >
              <template #label="{ label }">
                <v-icon icon="mdi-relation-one-to-one" class="mr-1" />
                {{ label }}
              </template>
            </v-select>
          </template>
          <v-checkbox-btn
            label="戦力の公開"
            class="card-item-check"
            :class="editable ? '' : 'readonly'"
            :readonly="!editable"
            :model-value="dataObj.data.used"
            @update:model-value="v => onUpdateEnigmaUsed(v)"
          />
          <v-checkbox-btn
            label="解除"
            class="card-item-check"
            :class="editable ? '' : 'readonly'"
            :readonly="!editable"
            :model-value="dataObj.data.disabled"
            @update:model-value="v => onUpdateEnigmaDisabled(v)"
          />
        </template>
        <template v-if="dataObj.type === 'shinobigami-persona'">
          <template v-if="editable || dataObj.data.leaked">
            <menu-edit-text-field
              label="真実名"
              icon="mdi-badge-account-outline"
              placeholder="未設定"
              :width="20"
              :text="dataObj.data.name"
              :editable="editable"
              :variant="editable ? 'solo' : 'outlined'"
              :class-text="editable ? '' : 'mt-2'"
              @update="onUpdatePersonaName"
            />
            <menu-edit-text-area
              :title="`${dataObj.data.name || 'ななし'}の効果の編集`"
              label="効果"
              placeholder="未設定"
              :editable="editable"
              :variant="editable ? 'solo' : 'outlined'"
              :textarea-class="editable ? '' : 'mt-2'"
              icon="mdi-script-text-outline"
              :text-rows="textRows"
              :text="dataObj.data.effect"
              :offset="-textRows * 24 + 18"
              @update="onUpdatePersonaEffect"
            />
          </template>
          <v-select
            :items="hasEmptyHandoutList"
            item-value="id"
            item-title="name"
            :readonly="!editable"
            :variant="editable ? 'solo' : 'outlined'"
            :class="editable ? '' : 'mt-3'"
            :flat="true"
            label="所有されるハンドアウト"
            class="align-self-start"
            :hide-details="true"
            style="width: 20rem; max-width: 20rem"
            :persistent-placeholder="true"
            :model-value="dataObj.data.bind"
            @update:model-value="v => onUpdatePersonaBind(v)"
          >
            <template #label="{ label }">
              <v-icon icon="mdi-relation-one-to-one" class="mr-1" />
              {{ label }}
            </template>
          </v-select>
          <v-checkbox-btn
            label="真実の公開"
            class="card-item-check"
            :class="editable ? '' : 'readonly'"
            :readonly="!editable"
            :model-value="dataObj.data.leaked"
            @update:model-value="v => onUpdatePersonaLeaked(v)"
          />
        </template>
        <template v-if="dataObj.type === 'shinobigami-prize'">
          <menu-edit-text-field
            label="名前"
            icon="mdi-tag-outline"
            placeholder="未設定"
            :width="20"
            :editable="editable"
            :variant="editable ? 'solo' : 'outlined'"
            :class-text="editable ? '' : 'mt-2'"
            :text="dataObj.data.name"
            @update="onUpdatePrizeName"
          />
          <menu-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の説明の編集`"
            label="説明"
            placeholder="未設定"
            :editable="editable"
            :variant="editable ? 'solo' : 'outlined'"
            :textarea-class="editable ? '' : 'mt-2'"
            icon="mdi-script-text-outline"
            :text-rows="textRows"
            :text="dataObj.data.description"
            :offset="-textRows * 24 + 18"
            @update="onUpdatePrizeDescription"
          />
          <menu-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の秘密の編集`"
            label="秘密"
            placeholder="未設定"
            :editable="editable"
            :variant="editable ? 'solo' : 'outlined'"
            :textarea-class="editable ? '' : 'mt-2'"
            icon="mdi-lock-outline"
            :text-rows="textRows"
            :text="dataObj.data.secret"
            :offset="-textRows * 24 + 18"
            v-if="!perspective || prizeSecret"
            @update="onUpdatePrizeSecret"
          />
          <v-select
            :items="hasEmptyHandoutList"
            item-value="id"
            item-title="name"
            :readonly="!editable"
            :variant="editable ? 'solo' : 'outlined'"
            :class="editable ? '' : 'mt-3'"
            :flat="true"
            label="所有者"
            class="align-self-start"
            persistent-hint
            hint="所有者はこのプライズの名前と説明を常に読めます"
            style="width: 20rem; max-width: 20rem"
            :persistent-placeholder="true"
            :model-value="dataObj.data.owner"
            @update:model-value="v => onUpdatePrizeOwner(v)"
          >
            <template #label="{ label }">
              <v-icon icon="mdi-relation-one-to-one" class="mr-1" />
              {{ label }}
            </template>
          </v-select>
          <v-card :variant="editable ? 'text' : 'outlined'" class="pa-3" :class="editable ? 'bg-white' : ''">
            <v-card-subtitle class="text-subtitle-2">このプライズの存在を知るハンドアウト</v-card-subtitle>
            <v-sheet class="d-flex flex-column bg-transparent">
              <handout-multi-checkbox
                :list="dataObj.data.readableList"
                :editable="editable"
                @update="onUpdatePrizeReadableList"
              />
            </v-sheet>
          </v-card>
          <v-card :variant="editable ? 'text' : 'outlined'" class="pa-3" :class="editable ? 'bg-white' : ''">
            <v-card-subtitle class="text-subtitle-2">このプライズの秘密を知るハンドアウト</v-card-subtitle>
            <v-sheet class="d-flex flex-column bg-transparent">
              <handout-multi-checkbox
                :list="dataObj.data.leakedList"
                :editable="editable"
                @update="onUpdatePrizeLeakedList"
              />
            </v-sheet>
          </v-card>
        </template>
      </v-sheet>
      <v-card-actions class="pt-0" v-if="editable">
        <v-spacer />
        <delete-menu-btn
          :target-name="
            dataObj.type === 'shinobigami-character' ? dataObj.data.character.characterName : dataObj.data.name
          "
          :session-id="graphQlStore?.state.session?.id"
          :type="typeList.find(t => t.value === dataObj.type)?.label || ''"
          @execute="onDeleteSessionData"
        />
      </v-card-actions>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

import DeleteMenuBtn from '@/components/DeleteMenuBtn.vue'
import AddSpecialArtsButton from '@/components/panes/Shinobigami/AddSpecialArtsButton.vue'
import HandoutMultiCheckbox from '@/components/panes/Shinobigami/HandoutMultiCheckbox.vue'
import { clone } from '@/components/panes/Shinobigami/PrimaryDataUtility'
import ReloadCharacterSheetButton from '@/components/panes/Shinobigami/ReloadCharacterSheetButton.vue'
import TokugiSelector from '@/components/panes/Shinobigami/TokugiSelector.vue'
import { ShinobiGami } from '@/components/panes/Shinobigami/shinobigami'
import MenuEditTextArea from '@/components/parts/MenuEditTextArea.vue'
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'
import { uuid } from 'vue-uuid'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import CorrelationsCard from '@/components/panes/Shinobigami/CorrelationsCard.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  dataId: string
  textRows: number
  perspective: string
  mode: 'view' | 'edit'
}>()

const editable = computed(() => !props.perspective && props.mode === 'edit')

const dataObj = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.dataId)
})

const otherHandouts = computed(() => {
  return graphQlStore?.state.sessionDataList.filter(sd => {
    if (sd.type !== 'shinobigami-handout') return false
    if (sd.id === dataObj.value.id) return false
    return !props.perspective || sd.data.published
  })
})

const prizeKnow = computed(() => {
  if (dataObj.value.type !== 'shinobigami-prize') return false
  const knowHandouts =
    graphQlStore?.state.sessionDataList.filter(sd => dataObj.value.data.readableList.some(r => r === sd.id)) || []
  const characters = knowHandouts
    .map(h => graphQlStore?.state.sessionDataList.find(sd => sd.id === h.data.person))
    .filter(sd => Boolean(sd))
  return characters.some(c => c.data.player === props.perspective)
})

const prizeSecret = computed(() => {
  if (dataObj.value.type !== 'shinobigami-prize') return false
  const knowHandouts =
    graphQlStore?.state.sessionDataList.filter(sd => dataObj.value.data.leakedList.some(r => r === sd.id)) || []
  const characters = knowHandouts
    .map(h => graphQlStore?.state.sessionDataList.find(sd => sd.id === h.data.person))
    .filter(sd => Boolean(sd))
  return characters.some(c => c.data.player === props.perspective)
})

const handoutSecretOpen = computed((): boolean => {
  if (!props.perspective) return true
  if (dataObj.value.type !== 'shinobigami-handout') return false

  // キャラクターのオーナーの場合
  if (dataObj.value.data.knowSelfSecret) {
    const handoutCharacter = graphQlStore?.state.sessionDataList.find(sd => sd.id === dataObj.value.data.person)
    if (props.perspective === handoutCharacter?.data.player) return true
  }

  const secretRelations = graphQlStore?.state.sessionDataList.filter(
    sd =>
      sd.type === 'shinobigami-handout-relation' && sd.data.type === 'secret' && sd.data.targetId === dataObj.value?.id
  )

  return (
    secretRelations.some(sd => {
      const targetHandout = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === sd.data.ownerId)
      const character = graphQlStore?.state.sessionDataList.find(sdc => sdc.id === targetHandout?.data.person)
      return props.perspective === character?.data.player
    }) || false
  )
})

const typeList = [
  { value: 'shinobigami-character', label: 'キャラクター', color: 'light-blue-accent-1', icon: () => 'mdi-human' },
  {
    value: 'shinobigami-handout',
    label: 'ハンドアウト',
    color: 'teal-lighten-4',
    icon: () => 'mdi-smart-card-outline'
  },
  {
    value: 'shinobigami-enigma',
    label: 'エニグマ',
    color: 'indigo-lighten-4',
    icon: data => (data.disabled ? 'mdi-bomb-off' : 'mdi-bomb')
  },
  { value: 'shinobigami-persona', label: 'ペルソナ', color: 'cyan-lighten-4', icon: () => 'mdi-badge-account-outline' },
  { value: 'shinobigami-prize', label: 'プライズ', color: 'amber-lighten-4', icon: () => 'mdi-treasure-chest-outline' }
]

const hasEmptyHandoutList = computed(() => {
  const handoutList = graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-handout') || []
  const resultList = handoutList.map(h => {
    const characterInfo = graphQlStore?.state.sessionDataList.find(sd => sd.id === h.data.person)
    const nameList = [h.data.name]
    if (characterInfo) {
      const characterName = characterInfo.data.character.characterName
      if (characterName) {
        nameList.push(` : ${characterName}`)
      }
      if (characterInfo.data.player) {
        const player = graphQlStore?.state.players.find(p => p.id === characterInfo.data.player)
        if (player) {
          nameList.push(` (${player.name})`)
        }
      }
    }
    return {
      id: h.id,
      name: nameList.join('')
    }
  })
  resultList.unshift({ id: '', name: '割当なし' })
  return resultList
})

async function onAddSpecialArts(name: string) {
  if (!dataObj.value || dataObj.value.type !== 'shinobigami-character') return
  const characterData = clone(dataObj.value.data.character)
  characterData.specialArtsList.push({
    _id: uuid.v4(),
    name,
    skill: '',
    effect: '',
    direction: ''
  })
  await graphQlStore?.updateShinobigamiCharacter(
    dataObj.value.id,
    dataObj.value.data.player,
    dataObj.value.data.viewPass,
    characterData
  )
}

async function onUpdateSpecialArtsHelper(updateFunc: (characterData: ShinobiGami) => boolean) {
  if (!dataObj.value || dataObj.value.type !== 'shinobigami-character') return
  const characterData = clone(dataObj.value.data.character)
  if (!updateFunc(characterData)) return
  await graphQlStore?.updateShinobigamiCharacter(
    dataObj.value.id,
    dataObj.value.data.player,
    dataObj.value.data.viewPass,
    characterData
  )
}

async function onUpdateSpecialArtsName(index: number, name: string) {
  await onUpdateSpecialArtsHelper(characterData => {
    if (characterData.specialArtsList.length <= index) return false
    if (characterData.specialArtsList[index].name === name) return false
    characterData.specialArtsList[index].name = name
    return true
  })
}

async function onUpdateSpecialArtsSkill(index: number, skill: string) {
  await onUpdateSpecialArtsHelper(characterData => {
    if (characterData.specialArtsList.length <= index) return false
    if (characterData.specialArtsList[index].skill === skill) return false
    characterData.specialArtsList[index].skill = skill
    return true
  })
}

async function onUpdateSpecialArtsEffect(index: number, effect: string) {
  await onUpdateSpecialArtsHelper(characterData => {
    if (characterData.specialArtsList.length <= index) return false
    if (characterData.specialArtsList[index].effect === effect) return false
    characterData.specialArtsList[index].effect = effect
    return true
  })
}

async function onDeleteSpecialArts(index: number) {
  await onUpdateSpecialArtsHelper(characterData => {
    if (characterData.specialArtsList.length <= index) return false
    characterData.specialArtsList.splice(index, 1)
    return true
  })
}

async function onUpdateSpecialArtsDirection(index: number, direction: string) {
  await onUpdateSpecialArtsHelper(characterData => {
    if (characterData.specialArtsList.length <= index) return false
    if (characterData.specialArtsList[index].direction === direction) return false
    characterData.specialArtsList[index].direction = direction
    return true
  })
}

const hasEmptyPlayers = computed(() => {
  if (!props.perspective) {
    return [{ id: '', name: '割当なし' }, { id: 'user', name: '主催者' }, ...(graphQlStore?.state.players || [])]
  }
  const player = graphQlStore?.state.players.find(p => p.id === props.perspective)
  return [
    { id: '', name: '割当なし' },
    { id: player?.id || '', name: 'あなた' }
  ]
})
const dataObjPlayerId = computed(() => {
  const playerId = dataObj.value.data.player
  return hasEmptyPlayers.value.some(p => p.id === playerId) ? playerId : ''
})

const hasEmptyCharacterList = computed(() => {
  const characterList = graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-character') || []
  const resultList = characterList.map(c => {
    const nameList = [c.data.character.characterName]
    if (c.data.player) {
      const player = graphQlStore?.state.players.find(p => p.id === c.data.player)
      if (player) {
        nameList.push(`(${player.id === props.perspective ? 'あなた' : player.name})`)
      }
    }
    return {
      id: c.id,
      name: nameList.join('')
    }
  })
  resultList.unshift({ id: '', name: '割当なし' })
  return resultList
})
const dataObjPerson = computed(() => {
  const person = dataObj.value.data.person
  return hasEmptyCharacterList.value.some(p => p.id === person) ? person : ''
})

async function onUpdateCharacterName(characterName: string) {
  if (dataObj.value.data.character.characterName === characterName) return
  const character = clone(dataObj.value.data.character)
  character.characterName = characterName
  await graphQlStore?.updateShinobigamiCharacter(
    dataObj.value.id,
    dataObj.value.data.player,
    dataObj.value.data.viewPass,
    character
  )
}

async function onUpdateCharacterPlayer(playerId: string) {
  if (dataObj.value.data.playerId === playerId) return
  await graphQlStore?.updateShinobigamiCharacter(
    dataObj.value.id,
    playerId,
    dataObj.value.data.viewPass,
    dataObj.value.data.character
  )
}

async function onUpdateHandoutName(name: string) {
  if (dataObj.value.data.name === name) return
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    name,
    dataObj.value.data.intro,
    dataObj.value.data.objective,
    dataObj.value.data.secret,
    dataObj.value.data.person,
    dataObj.value.data.published,
    dataObj.value.data.knowSelfSecret
  )
}

async function onUpdateHandoutIntro(intro: string) {
  if (dataObj.value.data.intro === intro) return
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    intro,
    dataObj.value.data.objective,
    dataObj.value.data.secret,
    dataObj.value.data.person,
    dataObj.value.data.published,
    dataObj.value.data.knowSelfSecret
  )
}

async function onUpdateHandoutObjective(objective: string) {
  if (dataObj.value.data.objective === objective) return
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.intro,
    objective,
    dataObj.value.data.secret,
    dataObj.value.data.person,
    dataObj.value.data.published,
    dataObj.value.data.knowSelfSecret
  )
}

async function onUpdateHandoutSecret(secret: string) {
  if (dataObj.value.data.secret === secret) return
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.intro,
    dataObj.value.data.objective,
    secret,
    dataObj.value.data.person,
    dataObj.value.data.published,
    dataObj.value.data.knowSelfSecret
  )
}

async function onUpdateHandoutPerson(person: string) {
  if (dataObj.value.data.person === person) return
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.intro,
    dataObj.value.data.objective,
    dataObj.value.data.secret,
    person,
    dataObj.value.data.published,
    dataObj.value.data.knowSelfSecret
  )
}

async function onUpdateHandoutPublished(published: boolean) {
  if (dataObj.value.data.published === published) return
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.intro,
    dataObj.value.data.objective,
    dataObj.value.data.secret,
    dataObj.value.data.person,
    published,
    dataObj.value.data.knowSelfSecret
  )
}

async function onUpdateHandoutKnowSelfSecret(knowSelfSecret: boolean) {
  if (dataObj.value.data.knowSelfSecret === knowSelfSecret) return
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.intro,
    dataObj.value.data.objective,
    dataObj.value.data.secret,
    dataObj.value.data.person,
    dataObj.value.data.published,
    knowSelfSecret
  )
}

async function onUpdateEnigmaName(name: string) {
  if (dataObj.value.data.name === name) return
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    name,
    dataObj.value.data.threat,
    dataObj.value.data.disableJudgement,
    dataObj.value.data.camouflage,
    dataObj.value.data.entityName,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.used,
    dataObj.value.data.disabled
  )
}

async function onUpdateEnigmaThreat(threat: number) {
  if (dataObj.value.data.threat === threat) return
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    threat,
    dataObj.value.data.disableJudgement,
    dataObj.value.data.camouflage,
    dataObj.value.data.entityName,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.used,
    dataObj.value.data.disabled
  )
}

async function onUpdateEnigmaDisableJudgement(disableJudgement: string) {
  if (dataObj.value.data.disableJudgement === disableJudgement) return
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.threat,
    disableJudgement,
    dataObj.value.data.camouflage,
    dataObj.value.data.entityName,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.used,
    dataObj.value.data.disabled
  )
}

async function onUpdateEnigmaCamouflage(camouflage: string) {
  if (dataObj.value.data.camouflage === camouflage) return
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.threat,
    dataObj.value.data.disableJudgement,
    camouflage,
    dataObj.value.data.entityName,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.used,
    dataObj.value.data.disabled
  )
}

async function onUpdateEnigmaEntityName(entityName: string) {
  if (dataObj.value.data.entityName === entityName) return
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.threat,
    dataObj.value.data.disableJudgement,
    dataObj.value.data.camouflage,
    entityName,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.used,
    dataObj.value.data.disabled
  )
}

async function onUpdateEnigmaEffect(effect: string) {
  if (dataObj.value.data.effect === effect) return
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.threat,
    dataObj.value.data.disableJudgement,
    dataObj.value.data.camouflage,
    dataObj.value.data.entityName,
    effect,
    dataObj.value.data.bind,
    dataObj.value.data.used,
    dataObj.value.data.disabled
  )
}

async function onUpdateEnigmaBind(bind: string) {
  if (dataObj.value.data.bind === bind) return
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.threat,
    dataObj.value.data.disableJudgement,
    dataObj.value.data.camouflage,
    dataObj.value.data.entityName,
    dataObj.value.data.effect,
    bind,
    dataObj.value.data.used,
    dataObj.value.data.disabled
  )
}

async function onUpdateEnigmaUsed(used: boolean) {
  if (dataObj.value.data.used === used) return
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.threat,
    dataObj.value.data.disableJudgement,
    dataObj.value.data.camouflage,
    dataObj.value.data.entityName,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    used,
    dataObj.value.data.disabled
  )
}

async function onUpdateEnigmaDisabled(disabled: boolean) {
  if (dataObj.value.data.disabled === disabled) return
  await graphQlStore?.updateShinobigamiEnigma(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.threat,
    dataObj.value.data.disableJudgement,
    dataObj.value.data.camouflage,
    dataObj.value.data.entityName,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.used,
    disabled
  )
}

async function onUpdatePersonaName(name: string) {
  if (dataObj.value.data.name === name) return
  await graphQlStore?.updateShinobigamiPersona(
    dataObj.value.id,
    name,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.leaked
  )
}

async function onUpdatePersonaEffect(effect: string) {
  if (dataObj.value.data.effect === effect) return
  await graphQlStore?.updateShinobigamiPersona(
    dataObj.value.id,
    dataObj.value.data.name,
    effect,
    dataObj.value.data.bind,
    dataObj.value.data.leaked
  )
}

async function onUpdatePersonaBind(bind: string) {
  if (dataObj.value.data.bind === bind) return
  await graphQlStore?.updateShinobigamiPersona(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.effect,
    bind,
    dataObj.value.data.leaked
  )
}

async function onUpdatePersonaLeaked(leaked: boolean) {
  if (dataObj.value.data.leaked === leaked) return
  await graphQlStore?.updateShinobigamiPersona(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    leaked
  )
}

async function onUpdatePrizeName(name: string) {
  if (dataObj.value.data.name === name) return
  await graphQlStore?.updateShinobigamiPrize(
    dataObj.value.id,
    name,
    dataObj.value.data.description,
    dataObj.value.data.secret,
    dataObj.value.data.owner,
    dataObj.value.data.readableList,
    dataObj.value.data.leakedList
  )
}

async function onUpdatePrizeDescription(description: string) {
  if (dataObj.value.data.description === description) return
  await graphQlStore?.updateShinobigamiPrize(
    dataObj.value.id,
    dataObj.value.data.name,
    description,
    dataObj.value.data.secret,
    dataObj.value.data.owner,
    dataObj.value.data.readableList,
    dataObj.value.data.leakedList
  )
}

async function onUpdatePrizeSecret(secret: string) {
  if (dataObj.value.data.secret === secret) return
  await graphQlStore?.updateShinobigamiPrize(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.description,
    secret,
    dataObj.value.data.owner,
    dataObj.value.data.readableList,
    dataObj.value.data.leakedList
  )
}

async function onUpdatePrizeOwner(owner: string) {
  if (dataObj.value.data.owner === owner) return
  await graphQlStore?.updateShinobigamiPrize(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.description,
    dataObj.value.data.secret,
    owner,
    dataObj.value.data.readableList,
    dataObj.value.data.leakedList
  )
}

async function onUpdatePrizeReadableList(readableList: string[]) {
  if (JSON.stringify(dataObj.value.data.readableList) === JSON.stringify(readableList)) return
  await graphQlStore?.updateShinobigamiPrize(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.description,
    dataObj.value.data.secret,
    dataObj.value.data.owner,
    readableList,
    dataObj.value.data.leakedList
  )
}

async function onUpdatePrizeLeakedList(leakedList: string[]) {
  if (JSON.stringify(dataObj.value.data.leakedList) === JSON.stringify(leakedList)) return
  await graphQlStore?.updateShinobigamiPrize(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.description,
    dataObj.value.data.secret,
    dataObj.value.data.owner,
    dataObj.value.data.readableList,
    leakedList
  )
}

async function onDeleteSessionData() {
  await graphQlStore?.deleteSessionData(props.dataId)
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

:deep(.card-item-check) {
  align-items: stretch !important;

  &:not(.readonly) {
    align-self: flex-start;
    background-color: white;
    border-radius: 0.3rem;
  }

  .v-label {
    height: auto !important;
  }

  &:not(.flex-column-reverse) .v-label {
    padding-right: 12px;
  }
}
</style>
