<template>
  <pane-frame title="役者管理ツール">
    <template #title-action></template>
    <template #layout>
      <v-sheet class="d-flex flex-row flex-wrap w-100 pa-1" style="gap: 0.1rem" v-if="!perspective">
        <url-form-menu
          text="キャラクターシート読込"
          @execute="onLoadCharacterSheet"
          :tips="[
            '公開中のシナリオシートを使う場合、閲覧することで秘匿情報閲覧パスがわかります。',
            '$b$PC$b$と$b$NPC$b$と$b$腹心$b$はWaddlefy上ではハンドアウトの一種として扱います。',
            '$b$PC$b$の推奨と$b$NPC$b$の概要は読み込みません。\n必要な場合は共有メモを使ってください。',
            '読み込み後は、$b$エニグマ$b$の偽装と解除条件の追記をお忘れなく！',
            '$b$プライズ$b$は名前だけ使って読み込みます。\n読込直後は非公開状態です。'
          ]"
        />
      </v-sheet>
    </template>
    <template #default>
      <template v-for="character in characters" :key="character.id">
        <v-sheet variant="plain" class="position-relative" style="overflow: visible">
          <v-card-title class="bg-amber sticky-title text-body-1">
            <span>{{ character.data.character.basic.characterName }}</span>
            <link-btn :href="character.data.character.url" />
          </v-card-title>
          <v-card-text class="py-1 px-1 d-flex flex-row flex-wrap align-end" style="gap: 0.3rem">
            <menu-edit-text-field
              :editable="true"
              variant="solo-filled"
              :width="20"
              icon="mdi-tag-text-outline"
              label="ドール名"
              :text="character.data.character.basic.characterName"
            />
            <reload-character-sheet-btn :character-id="character.id" />
            <delete-menu-btn
              :target-name="character.data.character.basic.characterName"
              type="ドール"
              location="bottom center"
              @execute="() => graphQlStore?.deleteSessionData(character.id)"
            />
          </v-card-text>
          <v-card-subtitle class="bg-amber-lighten-3 text-body-2 sticky-subtitle">マニューバ</v-card-subtitle>
          <v-card-text class="py-1 px-1 d-flex flex-row flex-wrap" style="gap: 0.3rem">
            <template v-for="(maneuver, idx) in character.data.character.maneuverList" :key="idx">
              <maneuver-card
                :maneuver="maneuver"
                @update="updateManeuver => onUpdateManeuver(character.id, idx, updateManeuver)"
              />
            </template>
          </v-card-text>
          <v-sheet class="sticky-subtitle">
            <v-card-subtitle class="bg-amber-lighten-3 text-body-2">未練</v-card-subtitle>
            <v-card-text class="pa-1">
              <v-btn variant="flat" color="secondary" density="comfortable" text="未練の追加" />
            </v-card-text>
          </v-sheet>
          <v-card-text class="pt-0 pb-1 px-1 d-flex flex-row flex-wrap align-start" style="gap: 0.3rem">
            <template v-for="(roice, idx) in character.data.character.roiceList" :key="idx">
              <roice-card
                :roice="roice"
                :deletable="true"
                @update="updateRoice => onUpdateRoice(character.id, idx, updateRoice)"
                @delete="onDeleteRoice(character.id, idx)"
              />
            </template>
          </v-card-text>
        </v-sheet>
      </template>
    </template>
    <template #nav></template>
  </pane-frame>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name: 'ActorManagePane',
  label: '役者管理'
}
</script>

<script setup lang="ts">
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import { computed, inject, ref } from 'vue'

import DeleteMenuBtn from '@/components/DeleteMenuBtn.vue'
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ManeuverCard from '@/components/panes/Nechronica/ManeuverCard.vue'
import ReloadCharacterSheetBtn from '@/components/panes/Nechronica/ReloadCharacterSheetBtn.vue'
import RoiceCard from '@/components/panes/Nechronica/RoiceCard.vue'
import UrlFormMenu from '@/components/panes/Nechronica/UrlFormMenu.vue'
import {
  Nechronica,
  NechronicaHelper,
  NechronicaManeuver,
  NechronicaRoice
} from '@/components/panes/Nechronica/nechronica'
import { clone } from '@/components/panes/PrimaryDataUtility'
import LinkBtn from '@/components/parts/LinkBtn.vue'
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const isUserControl = computed(() => Boolean(graphQlStore?.state.user?.token))

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

// eslint-disable-next-line unused-imports/no-unused-vars
const emits = defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
}>()

const perspective = ref(isUserControl.value ? '' : graphQlStore?.state.player?.id || '')

const characters = computed((): { id: string; data: { player: string; character: Nechronica } }[] => {
  return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'nechronica-character') || []
})

async function onLoadCharacterSheet(url: string) {
  const helper = new NechronicaHelper(url)
  if (helper.isThis()) {
    const { data } = await helper.getData()
    if (!data) {
      graphQlStore?.addNotification('キャラクターシートの読込に失敗しました。', 'mdi-alert-circle-outline', 'error')
      return
    }
    console.log(JSON.stringify(data, null, 2))
    await graphQlStore?.addNechronicaCharacter(perspective.value, data)
  }
}

function updateNechronicaCharacterHelper(characterId: string, wrapFunc: (character: Nechronica) => boolean) {
  const c = graphQlStore?.state.sessionDataList.find(sd => sd.id === characterId)
  if (!c) return
  const updateCharacter = clone<Nechronica>(c.data.character)!
  if (!wrapFunc(updateCharacter)) return
  graphQlStore?.updateNechronicaCharacter(characterId, c.data.player, updateCharacter)
}

function onUpdateRoice(characterId: string, idx: number, roice: NechronicaRoice) {
  updateNechronicaCharacterHelper(characterId, c => {
    if (JSON.stringify(roice) === JSON.stringify(c.roiceList[idx])) return false
    c.roiceList[idx] = roice
    return true
  })
}

function onDeleteRoice(characterId: string, idx: number) {
  updateNechronicaCharacterHelper(characterId, c => {
    c.roiceList.splice(idx, 1)
    return true
  })
}

function onUpdateManeuver(characterId: string, idx: number, maneuver: NechronicaManeuver) {
  updateNechronicaCharacterHelper(characterId, c => {
    if (JSON.stringify(c.maneuverList[idx]) === JSON.stringify(maneuver)) return false
    c.maneuverList[idx] = maneuver
    return true
  })
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
$title-height: 2rem;

.sticky-title {
  position: sticky;
  top: 0;
  height: $title-height;
  box-sizing: border-box;
  padding-top: 0;
  padding-bottom: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  z-index: 2;
}
.sticky-subtitle {
  position: sticky;
  top: $title-height;
  z-index: 1;
  opacity: 1;
}
</style>
