<template>
  <pane-frame title="シナリオデータ管理ツール">
    <template #title-action>
      <template v-if="isUserControl">
        <v-defaults-provider :defaults="{ VSelect: { variant: 'plain', hideDetails: true, class: 'menu-select' } }">
          <v-select prefix="視点:" :items="perspectiveList" item-title="name" item-value="value" v-model="perspective">
            <template #prepend-inner>
              <v-icon icon="mdi-triangle-small-down" />
            </template>
          </v-select>
        </v-defaults-provider>
      </template>

      <v-menu :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn variant="text" v-bind="props" class="pl-1 pr-2">
            <v-icon icon="mdi-triangle-small-down" />
            表示制御
          </v-btn>
        </template>
        <div style="background-color: white; margin-top: -2px" class="pr-2 border-s border-e border-b border-t">
          <v-label class="text-body-2 ml-4">テキスト行数</v-label>
          <v-defaults-provider :defaults="{ VSlider: { density: 'compact', hideDetails: true, min: 2, step: 1 } }">
            <v-slider class="ml-4" :hide-details="true" v-model="textRows" :max="20" />
          </v-defaults-provider>
        </div>
      </v-menu>
    </template>
    <template #layout>
      <v-sheet class="d-flex flex-row flex-wrap w-100 px-2 pa-2" style="gap: 0.1rem" v-if="!perspective">
        <shinobigami-url-form-menu
          text="シナリオシート読込"
          pass-placeholder="必須"
          @execute="onLoadScenarioSheet"
          :tips="[
            '公開中のシナリオシートを使う場合、閲覧することで秘匿情報閲覧パスがわかります。',
            '$b$PC$b$と$b$NPC$b$と$b$腹心$b$はWaddlefy上ではハンドアウトの一種として扱います。',
            '$b$PC$b$の推奨と$b$NPC$b$の概要は読み込みません。\n必要な場合は共有メモを使ってください。',
            '読み込み後は、$b$エニグマ$b$の偽装と解除条件の追記をお忘れなく！',
            '$b$プライズ$b$は名前だけ使って読み込みます。\n読込直後は非公開状態です。'
          ]"
        />
        <v-divider :vertical="true" />
        <v-defaults-provider :defaults="{ VBtn: { variant: 'text', color: 'primary', density: 'comfortable' } }">
          <v-btn class="text-decoration-underline" @click="onAddData('handout')">ハンドアウト追加</v-btn>
          <v-btn class="text-decoration-underline" @click="onAddData('enigma')">エニグマ追加</v-btn>
          <v-btn class="text-decoration-underline" @click="onAddData('prize')">プライズ追加</v-btn>
          <v-btn class="text-decoration-underline" @click="onAddData('persona')">ペルソナ追加</v-btn>
        </v-defaults-provider>
      </v-sheet>
    </template>
    <template #default>
      <v-sheet class="w-100 d-flex flex-row flex-wrap align-start" :class="perspective ? 'pt-3' : ''">
        <template v-for="handout in handoutList" :key="handout.id">
          <scenario-data-card mode="edit" :data-id="handout.id" :text-rows="textRows" :perspective="perspective" />
        </template>
        <template v-for="enigma in enigmaList" :key="enigma.id">
          <scenario-data-card mode="edit" :data-id="enigma.id" :text-rows="textRows" :perspective="perspective" />
        </template>
        <template v-for="prize in prizeList" :key="prize.id">
          <scenario-data-card mode="edit" :data-id="prize.id" :text-rows="textRows" :perspective="perspective" />
        </template>
        <template v-for="persona in personaList" :key="persona.id">
          <scenario-data-card mode="edit" :data-id="persona.id" :text-rows="textRows" :perspective="perspective" />
        </template>
      </v-sheet>
    </template>
  </pane-frame>
  <v-overlay
    :model-value="progress < 100"
    :persistent="true"
    :contained="true"
    class="d-flex justify-center align-center"
    style="backdrop-filter: blur(2px)"
  >
    <v-card rounded="xl">
      <v-card-title> シナリオシートの読み込み中 </v-card-title>
      <v-card-text class="text-center">
        <v-progress-circular size="150" color="primary" width="15" class="" :model-value="progress">
          <span class="text-h4">{{ progress }}%</span>
        </v-progress-circular>
      </v-card-text>
    </v-card>
  </v-overlay>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name: 'HandoutManagePane',
  label: 'シナリオデータ管理'
}
</script>

<script setup lang="ts">
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import { computed, inject, ref } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ScenarioDataCard from '@/components/panes/Shinobigami/ScenarioDataCard.vue'
import ShinobigamiUrlFormMenu from '@/components/panes/Shinobigami/ShinobigamiUrlFormMenu.vue'
import { ShinobigamiScenarioHelper } from '@/components/panes/Shinobigami/shinobigami-scenario'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const isUserControl = computed(() => Boolean(graphQlStore?.state.user?.token))

defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
}>()

const perspectiveList = computed(() => [
  { value: '', name: '主催者' },
  ...(graphQlStore?.state.players.map(p => ({ value: p.id, name: p.name })) || [])
])

const perspective = ref(isUserControl.value ? '' : graphQlStore?.state.player?.id || '')
const textRows = ref(3)

const handoutList = computed(() => {
  if (!perspective.value) {
    return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-handout')
  }
  return graphQlStore?.state.sessionDataList.filter(sd => {
    if (sd.type !== 'shinobigami-handout') return false
    if (sd.data.published) return true

    // 公開してなくても担当キャラだったらハンドアウトが見える
    const character = graphQlStore.state.sessionDataList.find(sdc => sdc.id === sd.data.person)
    const player = graphQlStore.state.players.find(p => p.id === character?.data.player)
    if (player?.id === perspective.value) return true

    // 公開していなくても関係のあるハンドアウトなら見える
    return graphQlStore.state.sessionDataList.some(r => {
      if (r.type !== 'shinobigami-handout-relation' || r.data.targetId !== sd.id) return false
      const handout = graphQlStore.state.sessionDataList.find(sdc => sdc.id === r.data.ownerId)
      const character = graphQlStore.state.sessionDataList.find(sdc => sdc.id === handout?.data.person)
      const player = graphQlStore.state.players.find(p => p.id === character?.data.player)
      return player?.id === perspective.value
    })
  })
})
const enigmaList = computed(() => {
  return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-enigma')
})
const personaList = computed(() => {
  return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-persona')
})
const prizeList = computed(() => {
  if (!perspective.value) {
    return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-prize')
  }
  return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-prize')
})

async function onAddData(type: 'handout' | 'enigma' | 'persona' | 'prize'): Promise<void> {
  if (type === 'handout') return graphQlStore?.addShinobigamiHandout()
  if (type === 'enigma') return graphQlStore?.addShinobigamiEnigma()
  if (type === 'persona') return graphQlStore?.addShinobigamiPersona()
  if (type === 'prize') return graphQlStore?.addShinobigamiPrize()
}

const progress = ref(100)
function updateProgress(total: number, current: number) {
  progress.value = Math.round((current * 100) / total)
}

async function onLoadScenarioSheet(url: string, password: string) {
  const helper = new ShinobigamiScenarioHelper(url, password)
  if (helper.isThis()) {
    const { data } = await helper.getData()
    if (!data) {
      graphQlStore?.addNotification('シナリオデータの読込に失敗しました。', 'mdi-alert-circle-outline', 'error')
      return
    }
    const { pc, npc, righthand, enigma, prize } = data
    const total = pc.length + npc.length + righthand.length + enigma.length + prize.length
    let count = 0
    for (const d of pc) {
      updateProgress(total, count)
      count++
      await graphQlStore?.addShinobigamiHandout(d.name, d.intro, d.mission, d.secret, true)
    }
    for (const d of npc) {
      updateProgress(total, count)
      count++
      await graphQlStore?.addShinobigamiHandout(d.name, d.intro, d.mission, d.secret, false)
    }
    for (const d of righthand) {
      updateProgress(total, count)
      count++
      const intro = `脅威度: ${d.menace}\n${d.notes}`
      await graphQlStore?.addShinobigamiHandout(d.name, intro, '', '', false)
    }
    for (const d of enigma) {
      updateProgress(total, count)
      count++
      await graphQlStore?.addShinobigamiEnigma(d.name, d.power, d.menace, d.notes)
    }
    for (const d of prize) {
      updateProgress(total, count)
      count++
      await graphQlStore?.addShinobigamiPrize(d.name)
    }
    updateProgress(total, count)
  }
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.menu-select {
  flex-grow: 0;

  :deep(.v-field__append-inner) {
    display: none;
  }
  :deep(.v-field__prepend-inner) .v-icon {
    opacity: 1 !important;
    text-align: right;
    font-size: 18px;
    margin-top: 4px;
  }
  :deep(.v-field__prepend-inner),
  :deep(.v-text-field__prefix),
  :deep(.v-field__input) {
    padding-top: 0;
    padding-left: 0;
    margin-top: 2px;
    color: black;
    font-size: 14px;
    min-height: auto;
  }
}
</style>
