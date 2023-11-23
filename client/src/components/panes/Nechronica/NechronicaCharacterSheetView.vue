<template>
  <v-sheet class="d-flex flex-row flex-wrap overflow-y-auto" style="gap: 0.5rem">
    <template v-if="character">
      <v-card
        variant="outlined"
        class="d-inline-block flex-column pa-2 rounded-xl overflow-y-auto"
        style="box-sizing: border-box"
      >
        <v-card-title
          class="d-flex flex-row text-no-wrap flex-wrap pa-0 align-center justify-space-between"
          :style="`max-width: ${(useColumns + 1) * 4}rem`"
        >
          <v-menu :close-on-content-click="false" scroll-strategy="close">
            <template v-slot:activator="{ props }">
              <v-btn variant="text" class="text-body-1 px-0" :text="`行動値：${actionValue}`" v-bind="props">
                <div class="d-flex flex-row align-end underline">
                  <span class="text-caption">行動値：</span>
                  <span class="text-h5">{{ actionValue }}</span>
                </div>
              </v-btn>
            </template>
            <v-card>
              <v-card-title>行動値</v-card-title>
              <v-card-text class="d-flex flex-row align-end flex-wrap">
                <span class="pb-1 text-center" style="line-height: 20px; font-size: 13px">基本値<br />６</span>
                <template v-for="(maneuver, idx) in character.data.character.maneuverList" :key="idx">
                  <v-sheet
                    v-if="maneuver.type === 3"
                    class="d-flex flex-column align-center pa-1"
                    :class="maneuver.lost ? 'bg-grey' : ''"
                  >
                    <nechronica-maneuver-btn-menu
                      :character="character.data.character"
                      :disable-button="true"
                      :maneuver="maneuver"
                      @update:lost="v => onUpdateManeuverLost(idx, v)"
                      @update:used="v => onUpdateManeuverUsed(idx, v)"
                    />
                    <span>{{ getNum(maneuver.memo) }}</span>
                  </v-sheet>
                </template>
              </v-card-text>
            </v-card>
          </v-menu>
          <v-menu :close-on-content-click="false" scroll-strategy="close" location="bottom right">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-cog" variant="text" size="small" v-bind="props" />
            </template>
            <v-card>
              <v-card-title class="d-flex">
                <span class="ellipsis" style="width: 10em !important">{{
                  character.data.character.basic.characterName
                }}</span>
                <span class="text-no-wrap">の設定</span>
              </v-card-title>
              <v-card-subtitle>１行の最大マニューバ数</v-card-subtitle>
              <v-defaults-provider :defaults="{ VSlider: vSliderDefault }">
                <v-slider show-ticks="always" v-model="useColumns" :min="4" :max="10">
                  <template v-slot:prepend>
                    <span style="width: 1.5em" class="text-right">{{ useColumns }}</span>
                  </template>
                </v-slider>
              </v-defaults-provider>
            </v-card>
          </v-menu>
        </v-card-title>
        <v-card-text class="d-flex flex-column align-stretch justify-center px-0 py-1">
          <v-menu :close-on-content-click="false" scroll-strategy="close" location="top left">
            <template v-slot:activator="{ props }">
              <v-sheet class="d-flex flex-row text-left align-center">
                <v-sheet
                  v-ripple
                  v-bind="props"
                  rounded="lg"
                  class="ellipsis text-h5 text-decoration-underline overflow-y-hidden"
                  style="width: 1em; flex-grow: 1"
                >
                  {{ character.data.character.basic.characterName }}
                </v-sheet>
                <v-btn
                  icon="mdi-open-in-new"
                  variant="flat"
                  size="small"
                  target="_blank"
                  rel="noopener noreferrer"
                  :href="character.data.character.url"
                />
              </v-sheet>
            </template>

            <v-card>
              <v-card-text class="d-flex flex-row align-end">
                <nechronica-icon-btn
                  :disable-button="true"
                  :under-text="positionList[character.data.character.basic.position]?.text || ''"
                  :class="positionList[character.data.character.basic.position].val || ''"
                />
                <span style="font-size: 11px; line-height: 1.2em">/</span>
                <nechronica-icon-btn
                  :disable-button="true"
                  :under-text="classList[character.data.character.basic.mainClass]?.text || ''"
                  class="small"
                  :class="classList[character.data.character.basic.mainClass].val || ''"
                />
                <template v-if="character.data.character.basic.mainClass !== character.data.character.basic.subClass">
                  <span style="font-size: 11px; line-height: 1.2em">/</span>
                  <nechronica-icon-btn
                    :disable-button="true"
                    :under-text="classList[character.data.character.basic.subClass]?.text || ''"
                    class="small"
                    :class="classList[character.data.character.basic.subClass].val || ''"
                  />
                </template>
                <template v-else>
                  <span style="font-size: 11px; line-height: 1.2em">×2</span>
                </template>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-card-text>
        <v-card-text class="d-flex flex-column pa-0">
          <nechronica-maneuver-view
            :view-lost="viewLost"
            :view-used="viewUsed"
            :view-label="viewLabel"
            :view-timings="viewTimings"
            :view-types="viewTypes"
            :view-basic-parts="viewBasicParts"
            :columns="useColumns"
            :character="character.data.character"
            @update:used="onUpdateManeuverUsed"
            @update:lost="onUpdateManeuverLost"
          />
        </v-card-text>
        <v-card-actions class="justify-end pb-0">
          <v-menu :close-on-content-click="false" location="top right" v-model="resetUsedMenu">
            <template v-slot:activator="{ props }">
              <v-btn
                color="primary"
                class="text-decoration-underline"
                v-bind="props"
                :disabled="character.data.character.maneuverList.every(m => !m.used)"
                >全て未使用状態にする</v-btn
              >
            </template>
            <v-card>
              <v-card-text>
                全てのマニューバを未使用状態にします。<br />
                よろしいですか？
              </v-card-text>
              <v-divider />
              <v-card-actions>
                <v-btn class="flex-grow-1" color="primary" variant="flat" text="適用する" @click="onResetUsedMenu" />
                <v-btn
                  class="text-decoration-underline flex-grow-1"
                  variant="text"
                  text="キャンセル"
                  @click="resetUsedMenu = false"
                />
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-card-actions>
      </v-card>
    </template>
  </v-sheet>
</template>

<script setup lang="ts">
import NechronicaIconBtn from '@/components/panes/Nechronica/NechronicaIconBtn.vue'
import NechronicaManeuverView from '@/components/panes/Nechronica/NechronicaManeuverView.vue'
import { Nechronica, NechronicaManeuver } from '@/components/panes/Nechronica/nechronica'
import { computed, inject, ref, watch } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import NechronicaManeuverBtnMenu from '@/components/panes/Nechronica/NechronicaManeuverBtnMenu.vue'
import { clone } from '@/components/panes/PrimaryDataUtility'

const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  characterId: string
  viewLabel?: keyof NechronicaManeuver | ''
  viewLost: boolean
  viewUsed: boolean
  viewTimings: number[]
  viewTypes: number[]
  viewBasicParts: boolean
}>()

const character = computed((): { id: string; data: { player: string; character: Nechronica } } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
})

const owner = computed(() => (graphQlStore?.state.user?.token ? 'user' : graphQlStore?.state.player?.id || ''))
const characterViewConfig = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => {
    if (sd.type !== 'target-config') return false
    if (sd.data.type !== 'character-view') return false
    return sd.data.owner === owner.value && sd.data.target === props.characterId
  })
})

const useColumns = ref(characterViewConfig.value ? characterViewConfig.value.data.data.columns : 10)

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

const positionList = [
  { val: '', text: '' },
  { val: 'alice', text: 'アリス' },
  { val: 'holic', text: 'ホリック' },
  { val: 'automaton', text: 'オートマトン' },
  { val: 'junk', text: 'ジャンク' },
  { val: 'coat', text: 'コート' },
  { val: 'sorority', text: 'ソロリティ' },
  { val: 'psychedelic', text: 'サイケデリック' }
]
const classList = [
  { val: '', text: '' },
  { val: 'stacy', text: 'ステーシー' },
  { val: 'thanatos', text: 'タナトス' },
  { val: 'gothic', text: 'ゴシック' },
  { val: 'requiem', text: 'レクイエム' },
  { val: 'baroque', text: 'バロック' },
  { val: 'romanesque', text: 'ロマネスク' }
]

function getNum(text: string): number {
  const num = parseInt(text, 10)
  if (!isNaN(num)) {
    return num
  }
  return 0
}

const actionValue = computed(() => {
  return (
    character.value?.data.character.maneuverList.reduce((prev, current) => {
      if (current.type === 3 && !current.lost) {
        return prev + getNum(current.memo)
      }
      return prev
    }, 6) || 0
  )
})

const vSliderDefault = {
  density: 'compact',
  persistentHint: true,
  step: 1,
  class: 'ml-3 mr-5',
  rounded: true,
  color: 'primary'
}

const resetUsedMenu = ref(false)

function updateNechronicaCharacterHelper(wrapFunc: (character: Nechronica) => void) {
  if (!character.value) return
  const updateCharacter = clone<Nechronica>(character.value.data.character)!
  wrapFunc(updateCharacter)
  graphQlStore?.updateNechronicaCharacter(props.characterId, character.value.player, updateCharacter)
}
function onResetUsedMenu() {
  resetUsedMenu.value = false

  updateNechronicaCharacterHelper(c => {
    if (c.maneuverList.every(m => !m.used)) return
    c.maneuverList.forEach(m => {
      m.used = false
    })
  })
}

function onUpdateManeuverUsed(idx: number, used: boolean) {
  updateNechronicaCharacterHelper(c => {
    if (c.maneuverList[idx].used === used) return
    c.maneuverList[idx].used = used
  })
}

function onUpdateManeuverLost(idx: number, lost: boolean) {
  updateNechronicaCharacterHelper(c => {
    if (c.maneuverList[idx].lost === lost) return
    c.maneuverList[idx].lost = lost
  })
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.underline {
  position: relative;

  &:before {
    content: '';
    position: absolute;
    bottom: 2px;
    left: -4px;
    right: -4px;
    margin: auto;
    border-bottom: 1px solid black;
  }
}
</style>
