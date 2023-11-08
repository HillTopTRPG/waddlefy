<template>
  <pane-frame title="シナリオデータ管理ツール">
    <template v-slot:title-action>
      <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn variant="text" v-bind="props" class="pl-1 pr-2">
            <v-icon icon="mdi-triangle-small-down" />
            表示制御
          </v-btn>
        </template>
        <div style="background-color: white; margin-top: -2px" class="pr-2 border-s border-e border-b border-t">
          <v-label class="text-body-2 ml-4">テキスト行数</v-label>
          <v-slider
            density="compact"
            class="ml-4"
            :hide-details="true"
            v-model="textRows"
            :min="2"
            :step="1"
            :max="20"
          />
        </div>
      </v-menu>
    </template>
    <template v-slot:layout>
      <v-sheet class="d-flex flex-row flex-wrap w-100 pa-2" style="gap: 0.1rem">
        <v-defaults-provider
          :defaults="{
            VBtn: {
              variant: 'text',
              color: 'primary',
              density: 'comfortable',
              class: 'text-decoration-underline'
            }
          }"
        >
          <v-btn @click="onAddData('handout')">ハンドアウト追加</v-btn>
          <v-btn @click="onAddData('enigma')">エニグマ追加</v-btn>
          <v-btn @click="onAddData('persona')">ペルソナ追加</v-btn>
          <v-btn @click="onAddData('prize')">プライズ追加</v-btn>
        </v-defaults-provider>
      </v-sheet>
    </template>
    <template v-slot:default>
      <v-sheet class="w-100 d-flex flex-row flex-wrap align-start">
        <scenario-data-card
          v-for="handout in handoutList"
          :key="handout.id"
          :data-id="handout.id"
          :text-rows="textRows"
        />
        <scenario-data-card v-for="enigma in enigmaList" :key="enigma.id" :data-id="enigma.id" :text-rows="textRows" />
        <scenario-data-card
          v-for="persona in personaList"
          :key="persona.id"
          :data-id="persona.id"
          :text-rows="textRows"
        />
        <scenario-data-card v-for="prize in prizeList" :key="prize.id" :data-id="prize.id" :text-rows="textRows" />
      </v-sheet>
    </template>
  </pane-frame>
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
import { computed, inject, ref } from 'vue'
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ScenarioDataCard from '@/components/panes/Shinobigami/ScenarioDataCard.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

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

const textRows = ref(3)

const handoutList = computed(() => graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-handout'))
const enigmaList = computed(() => graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-enigma'))
const personaList = computed(() => graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-persona'))
const prizeList = computed(() => graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'shinobigami-prize'))

async function onAddData(type: 'handout' | 'enigma' | 'persona' | 'prize'): Promise<void> {
  if (type === 'handout') return graphQlStore?.addShinobigamiHandout()
  if (type === 'enigma') return graphQlStore?.addShinobigamiEnigma()
  if (type === 'persona') return graphQlStore?.addShinobigamiPersona()
  if (type === 'prize') return graphQlStore?.addShinobigamiPrize()
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
