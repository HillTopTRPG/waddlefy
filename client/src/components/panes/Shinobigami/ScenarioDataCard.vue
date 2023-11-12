<template>
  <v-card
    v-if="dataObj"
    :color="typeList.find(t => t.value === dataObj.type)?.color || ''"
    class="ml-3 mb-3 border elevation-4"
    rounded="lg"
  >
    <v-card-title class="ma-0 py-2" color="red">
      <v-icon :icon="typeList.find(t => t.value === dataObj.type)?.icon(dataObj.data)" class="mr-1" />
      <span>{{ typeList.find(t => t.value === dataObj.type)?.label || '' }}</span>
    </v-card-title>
    <v-card-item class="pa-0">
      <v-sheet class="d-flex flex-column align-self-start px-2 bg-transparent" style="gap: 0.5rem">
        <template v-if="dataObj.type === 'shinobigami-character'">
          <reload-character-sheet-button :character-id="dataObj.id" />
          <menu-edit-text-field
            :title="`${dataObj.data.character.characterName || 'ななし'}の名前編集`"
            label="名前"
            icon="mdi-tag-outline"
            placeholder="未設定"
            :width="20"
            :text="dataObj.data.character.characterName"
            :editable="true"
            @update="onUpdateShinobigamiCharacterName"
          />
          <v-select
            :items="hasEmptyPlayers"
            item-value="id"
            item-title="name"
            variant="solo"
            :flat="true"
            label="プレイヤー"
            class="align-self-start"
            :hide-details="true"
            style="width: 20rem; max-width: 20rem"
            :persistent-placeholder="true"
            :model-value="dataObj.data.player"
            @update:model-value="v => onUpdateShinobigamiCharacterPlayer(v)"
          >
            <template v-slot:label="{ label }">
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
                  title="奥義名"
                  :editable="true"
                  icon="mdi-khanda"
                  :width="19"
                  label="奥義名"
                  :text="arts.name || ''"
                  placeholder=""
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
            :model-value="dataObj.data.published"
            @update:model-value="v => onUpdateShinobigamiHandoutPublished(v)"
          />
          <menu-edit-text-field
            :title="`${dataObj.data.name || 'ななし'}の名前編集`"
            label="名前"
            icon="mdi-tag-outline"
            placeholder="未設定"
            :width="20"
            :text="dataObj.data.name"
            :editable="true"
            @update="onUpdateShinobigamiHandoutName"
          />
          <menu-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の使命の編集`"
            label="使命"
            placeholder="未設定"
            :editable="true"
            icon="mdi-bullseye"
            variant="solo"
            :text-rows="textRows"
            :text="dataObj.data.objective"
            :offset="-textRows * 24 + 18"
            @update="onUpdateShinobigamiHandoutObjective"
          />
          <menu-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の秘密の編集`"
            label="秘密"
            placeholder="未設定"
            :editable="true"
            icon="mdi-lock-outline"
            variant="solo"
            :text-rows="textRows"
            :text="dataObj.data.secret"
            :offset="-textRows * 24 + 18"
            @update="onUpdateShinobigamiHandoutSecret"
          />
          <v-checkbox-btn
            label="自身の秘密を知っている"
            :model-value="dataObj.data.knowSelfSecret"
            @update:model-value="v => onUpdateShinobigamiHandoutKnowSelfSecret(v)"
          />
          <v-select
            :items="hasEmptyCharacterList"
            item-value="id"
            item-title="name"
            variant="solo"
            :flat="true"
            label="担当キャラ"
            class="align-self-start"
            :hide-details="true"
            style="width: 20rem; max-width: 20rem"
            :persistent-placeholder="true"
            :model-value="dataObj.data.person"
            @update:model-value="v => onUpdateShinobigamiHandoutPerson(v)"
          >
            <template v-slot:label="{ label }">
              <v-icon icon="mdi-relation-one-to-one" class="mr-1" />
              {{ label }}
            </template>
          </v-select>
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
                          <v-textarea
                            label="演出"
                            :auto-grow="true"
                            :rows="1"
                            :max-rows="5"
                            :model-value="arts.direction"
                          />
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
        <template v-if="dataObj.type === 'shinobigami-enigma'">
          <menu-edit-text-field
            :title="`${dataObj.data.name || 'ななし'}の名前編集`"
            label="名前"
            icon="mdi-tag-outline"
            placeholder="未設定"
            :width="20"
            :text="dataObj.data.name"
            :editable="true"
            @update="onUpdateShinobigamiEnigmaName"
          />
          <menu-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の偽装の編集`"
            label="偽装"
            placeholder="未設定"
            :editable="true"
            icon="mdi-emoticon-cool-outline"
            variant="solo"
            :text-rows="textRows"
            :text="dataObj.data.camouflage"
            :offset="-textRows * 24 + 18"
            @update="onUpdateShinobigamiEnigmaCamouflage"
          />
          <menu-edit-text-field
            :title="`${dataObj.data.name || 'ななし'}の戦力の名称の編集`"
            label="戦力の名称"
            icon="mdi-skull-crossbones-outline"
            placeholder="未設定"
            :width="20"
            :text="dataObj.data.entityName"
            :editable="true"
            @update="onUpdateShinobigamiEnigmaEntityName"
          />
          <v-sheet class="d-flex flex-row flex-wrap bg-transparent" style="gap: 0.5rem">
            <v-select
              :items="[1, 2, 3, 4, 5]"
              label="脅威度"
              variant="solo"
              :flat="true"
              class="align-self-start"
              :hide-details="true"
              :persistent-placeholder="true"
              style="min-width: 6.5em; max-width: 6.5em; gap: 0"
              :model-value="dataObj.data.threat"
              @update:model-value="v => onUpdateShinobigamiEnigmaThreat(v)"
            >
              <template v-slot:label="{ label }">
                <v-icon icon="mdi-altimeter" class="mr-1" />
                {{ label }}
              </template>
            </v-select>
            <menu-edit-text-field
              :title="`${dataObj.data.name || 'ななし'}の解除条件の編集`"
              label="解除条件"
              icon="mdi-hammer"
              placeholder="未設定"
              :width="13"
              :editable="true"
              :text="dataObj.data.disableJudgement"
              @update="onUpdateShinobigamiEnigmaDisableJudgement"
            />
          </v-sheet>
          <menu-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の効果の編集`"
            label="効果"
            placeholder="未設定"
            :editable="true"
            icon="mdi-bomb"
            variant="solo"
            :text-rows="textRows"
            :text="dataObj.data.effect"
            :offset="-textRows * 24 + 18"
            @update="onUpdateShinobigamiEnigmaEffect"
          />
          <v-select
            :items="hasEmptyHandoutList"
            item-value="id"
            item-title="name"
            variant="solo"
            :flat="true"
            label="バインド"
            class="align-self-start"
            :hide-details="true"
            style="width: 20rem; max-width: 20rem"
            :persistent-placeholder="true"
            :model-value="dataObj.data.bind"
            @update:model-value="v => onUpdateShinobigamiEnigmaBind(v)"
          >
            <template v-slot:label="{ label }">
              <v-icon icon="mdi-relation-one-to-one" class="mr-1" />
              {{ label }}
            </template>
          </v-select>
          <v-checkbox-btn
            label="戦力の公開"
            :model-value="dataObj.data.used"
            @update:model-value="v => onUpdateShinobigamiEnigmaUsed(v)"
          />
          <v-checkbox-btn
            label="解除"
            :model-value="dataObj.data.disabled"
            @update:model-value="v => onUpdateShinobigamiEnigmaDisabled(v)"
          />
        </template>
        <template v-if="dataObj.type === 'shinobigami-persona'">
          <menu-edit-text-field
            :title="`${dataObj.data.name || 'ななし'}の真実名の編集`"
            label="真実名"
            icon="mdi-badge-account-outline"
            placeholder="未設定"
            :width="20"
            :text="dataObj.data.name"
            :editable="true"
            @update="onUpdateShinobigamiPersonaName"
          />
          <menu-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の効果の編集`"
            label="効果"
            placeholder="未設定"
            :editable="true"
            icon="mdi-script-text-outline"
            variant="solo"
            :text-rows="textRows"
            :text="dataObj.data.effect"
            :offset="-textRows * 24 + 18"
            @update="onUpdateShinobigamiPersonaEffect"
          />
          <v-select
            :items="hasEmptyHandoutList"
            item-value="id"
            item-title="name"
            variant="solo"
            :flat="true"
            label="所有されるハンドアウト"
            class="align-self-start"
            :hide-details="true"
            style="width: 20rem; max-width: 20rem"
            :persistent-placeholder="true"
            :model-value="dataObj.data.bind"
            @update:model-value="v => onUpdateShinobigamiPersonaBind(v)"
          >
            <template v-slot:label="{ label }">
              <v-icon icon="mdi-relation-one-to-one" class="mr-1" />
              {{ label }}
            </template>
          </v-select>
          <v-checkbox-btn
            label="真実の公開"
            :model-value="dataObj.data.leaked"
            @update:model-value="v => onUpdateShinobigamiPersonaLeaked(v)"
          />
        </template>
        <template v-if="dataObj.type === 'shinobigami-prize'">
          <menu-edit-text-field
            :title="`${dataObj.data.name || 'ななし'}の名前編集`"
            label="名前"
            icon="mdi-tag-outline"
            placeholder="未設定"
            :width="20"
            :editable="true"
            :text="dataObj.data.name"
            @update="onUpdateShinobigamiPrizeName"
          />
          <menu-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の説明の編集`"
            label="説明"
            placeholder="未設定"
            :editable="true"
            icon="mdi-script-text-outline"
            variant="solo"
            :text-rows="textRows"
            :text="dataObj.data.description"
            :offset="-textRows * 24 + 18"
            @update="onUpdateShinobigamiPrizeDescription"
          />
          <menu-edit-text-area
            :title="`${dataObj.data.name || 'ななし'}の秘密の編集`"
            label="秘密"
            placeholder="未設定"
            :editable="true"
            icon="mdi-lock-outline"
            variant="solo"
            :text-rows="textRows"
            :text="dataObj.data.secret"
            :offset="-textRows * 24 + 18"
            @update="onUpdateShinobigamiPrizeSecret"
          />
          <v-select
            :items="hasEmptyHandoutList"
            item-value="id"
            item-title="name"
            variant="solo"
            :flat="true"
            label="所有者"
            class="align-self-start"
            persistent-hint
            hint="所有者はこのプライズの名前と説明を常に読めます"
            style="width: 20rem; max-width: 20rem"
            :persistent-placeholder="true"
            :model-value="dataObj.data.owner"
            @update:model-value="v => onUpdateShinobigamiPrizeOwner(v)"
          >
            <template v-slot:label="{ label }">
              <v-icon icon="mdi-relation-one-to-one" class="mr-1" />
              {{ label }}
            </template>
          </v-select>
          <v-card variant="text" class="bg-white pa-3">
            <v-card-subtitle class="text-body-2">このプライズの存在を知るハンドアウト</v-card-subtitle>
            <v-sheet class="d-flex flex-column bg-transparent">
              <handout-multi-checkbox
                :list="dataObj.data.readableList"
                @update="onUpdateShinobigamiPrizeReadableList"
              />
            </v-sheet>
          </v-card>
          <v-card variant="text" class="bg-white pa-3">
            <v-card-subtitle class="text-body-2">このプライズの秘密を知るハンドアウト</v-card-subtitle>
            <v-sheet class="d-flex flex-column bg-transparent">
              <handout-multi-checkbox :list="dataObj.data.leakedList" @update="onUpdateShinobigamiPrizeLeakedList" />
            </v-sheet>
          </v-card>
        </template>
      </v-sheet>
      <v-card-actions>
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

import MenuEditTextField from '@/components/panes/Shinobigami/MenuEditTextField.vue'
import MenuEditTextArea from '@/components/panes/Shinobigami/MenuEditTextArea.vue'
import HandoutMultiCheckbox from '@/components/panes/Shinobigami/HandoutMultiCheckbox.vue'
import DeleteMenuBtn from '@/components/DeleteMenuBtn.vue'
import { ShinobiGami, ShinobigamiEmotion } from '@/components/panes/Shinobigami/shinobigami'
import { omit } from 'lodash'
import AddSpecialArtsButton from '@/components/panes/Shinobigami/AddSpecialArtsButton.vue'
import { clone } from '@/components/panes/Shinobigami/PrimaryDataUtility'
import TokugiSelector from '@/components/panes/Shinobigami/TokugiSelector.vue'
import { uuid } from 'vue-uuid'
import ReloadCharacterSheetButton from '@/components/panes/Shinobigami/ReloadCharacterSheetButton.vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  dataId: string
  textRows: number
}>()

const dataObj = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.dataId)
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

const hasEmptyHandoutList = computed(() => {
  const handoutList = graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-handout') || []
  const resultList = handoutList.map(h => {
    const characterInfo = graphQlStore?.state.sessionDataList.find(sd => sd.id === h.data.person)
    const nameList = [h.data.name]
    if (characterInfo) {
      const characterName = characterInfo.data.character.characterName
      if (characterName) {
        nameList.push(` (${characterName}`)
      }
      if (characterInfo.data.player) {
        const player = graphQlStore?.state.players.find(p => p.id === characterInfo.data.player)
        if (player) {
          nameList.push(` : ${player.name})`)
        }
      }
      if (nameList.length < 3) {
        nameList.push(')')
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

const hasEmptyPlayers = computed(() => [{ id: '', name: '割当なし' }, ...graphQlStore.state.players] || [])

const hasEmptyCharacterList = computed(() => {
  const characterList = graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-character') || []
  const resultList = characterList.map(c => {
    const nameList = [c.data.character.characterName]
    if (c.data.player) {
      const player = graphQlStore?.state.players.find(p => p.id === c.data.player)
      if (player) {
        nameList.push(`(${player.name})`)
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

async function onUpdateShinobigamiCharacterName(characterName: string) {
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

async function onUpdateShinobigamiCharacterPlayer(playerId: string) {
  if (dataObj.value.data.playerId === playerId) return
  await graphQlStore?.updateShinobigamiCharacter(
    dataObj.value.id,
    playerId,
    dataObj.value.data.viewPass,
    dataObj.value.data.character
  )
}

async function onUpdateShinobigamiHandoutName(name: string) {
  if (dataObj.value.data.name === name) return
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    name,
    dataObj.value.data.objective,
    dataObj.value.data.secret,
    dataObj.value.data.person,
    dataObj.value.data.published,
    dataObj.value.data.knowSelfSecret
  )
}

async function onUpdateShinobigamiHandoutObjective(objective: string) {
  if (dataObj.value.data.objective === objective) return
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    objective,
    dataObj.value.data.secret,
    dataObj.value.data.person,
    dataObj.value.data.published,
    dataObj.value.data.knowSelfSecret
  )
}

async function onUpdateShinobigamiHandoutSecret(secret: string) {
  if (dataObj.value.data.secret === secret) return
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.objective,
    secret,
    dataObj.value.data.person,
    dataObj.value.data.published,
    dataObj.value.data.knowSelfSecret
  )
}

async function onUpdateShinobigamiHandoutPerson(person: string) {
  if (dataObj.value.data.person === person) return
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.objective,
    dataObj.value.data.secret,
    person,
    dataObj.value.data.published,
    dataObj.value.data.knowSelfSecret
  )
}

async function onUpdateShinobigamiHandoutPublished(published: boolean) {
  if (dataObj.value.data.published === published) return
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.objective,
    dataObj.value.data.secret,
    dataObj.value.data.person,
    published,
    dataObj.value.data.knowSelfSecret
  )
}

async function onUpdateShinobigamiHandoutKnowSelfSecret(knowSelfSecret: boolean) {
  if (dataObj.value.data.knowSelfSecret === knowSelfSecret) return
  await graphQlStore?.updateShinobigamiHandout(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.objective,
    dataObj.value.data.secret,
    dataObj.value.data.person,
    dataObj.value.data.published,
    knowSelfSecret
  )
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

async function onUpdateShinobigamiEnigmaName(name: string) {
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

async function onUpdateShinobigamiEnigmaThreat(threat: number) {
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

async function onUpdateShinobigamiEnigmaDisableJudgement(disableJudgement: string) {
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

async function onUpdateShinobigamiEnigmaCamouflage(camouflage: string) {
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

async function onUpdateShinobigamiEnigmaEntityName(entityName: string) {
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

async function onUpdateShinobigamiEnigmaEffect(effect: string) {
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

async function onUpdateShinobigamiEnigmaBind(bind: string) {
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

async function onUpdateShinobigamiEnigmaUsed(used: boolean) {
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

async function onUpdateShinobigamiEnigmaDisabled(disabled: boolean) {
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

async function onUpdateShinobigamiPersonaName(name: string) {
  if (dataObj.value.data.name === name) return
  await graphQlStore?.updateShinobigamiPersona(
    dataObj.value.id,
    name,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    dataObj.value.data.leaked
  )
}

async function onUpdateShinobigamiPersonaEffect(effect: string) {
  if (dataObj.value.data.effect === effect) return
  await graphQlStore?.updateShinobigamiPersona(
    dataObj.value.id,
    dataObj.value.data.name,
    effect,
    dataObj.value.data.bind,
    dataObj.value.data.leaked
  )
}

async function onUpdateShinobigamiPersonaBind(bind: string) {
  if (dataObj.value.data.bind === bind) return
  await graphQlStore?.updateShinobigamiPersona(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.effect,
    bind,
    dataObj.value.data.leaked
  )
}

async function onUpdateShinobigamiPersonaLeaked(leaked: boolean) {
  if (dataObj.value.data.leaked === leaked) return
  await graphQlStore?.updateShinobigamiPersona(
    dataObj.value.id,
    dataObj.value.data.name,
    dataObj.value.data.effect,
    dataObj.value.data.bind,
    leaked
  )
}

async function onUpdateShinobigamiPrizeName(name: string) {
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

async function onUpdateShinobigamiPrizeDescription(description: string) {
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

async function onUpdateShinobigamiPrizeSecret(secret: string) {
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

async function onUpdateShinobigamiPrizeOwner(owner: string) {
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

async function onUpdateShinobigamiPrizeReadableList(readableList: string[]) {
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

async function onUpdateShinobigamiPrizeLeakedList(leakedList: string[]) {
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
</style>
