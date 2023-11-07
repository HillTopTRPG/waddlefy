<template>
  <pane-frame title="ハンドアウト管理ツール">
    <template v-slot:title-action> </template>
    <template v-slot:layout> </template>
    <template v-slot:default>
      <v-sheet class="w-100 d-flex flex-row flex-wrap align-end">
        <v-card variant="flat" class="w-100 ma-0">
          <v-card-item class="pa-2">
            <v-sheet class="d-flex flex-row flex-wrap pa-0" style="gap: 0.1rem">
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
          </v-card-item>
        </v-card>
      </v-sheet>
      <v-sheet class="w-100 d-flex flex-row flex-wrap align-start">
        <handout-card v-for="handout in handoutList" :key="handout.id" :data-id="handout.id" />
        <handout-card v-for="enigma in enigmaList" :key="enigma.id" :data-id="enigma.id" />
        <handout-card v-for="persona in personaList" :key="persona.id" :data-id="persona.id" />
        <handout-card v-for="prize in prizeList" :key="prize.id" :data-id="prize.id" />
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
  label: 'ハンドアウト管理'
}
</script>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import HandoutCard from '@/components/panes/Shinobigami/HandoutCard.vue'
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
