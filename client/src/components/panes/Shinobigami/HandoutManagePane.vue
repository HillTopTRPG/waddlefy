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
                <v-btn>ハンドアウト追加</v-btn>
                <v-btn>エニグマ追加</v-btn>
                <v-btn>ペルソナ追加</v-btn>
                <v-btn>プライズ追加</v-btn>
              </v-defaults-provider>
            </v-sheet>
          </v-card-item>
        </v-card>
      </v-sheet>
      <v-sheet class="w-100 d-flex flex-row flex-wrap align-end">
        <v-card class="w-100 mx-0" variant="flat">
          <v-card-title class="d-flex flex-row align-center">
            <span>ハンドアウト追加</span>
            <v-select
              :hide-details="true"
              label="種類"
              density="compact"
              variant="solo"
              class="flex-0-1 ml-3"
              :items="addTypeList"
              v-model="addType"
              :item-props="true"
              item-title="label"
              item-value="value"
            ></v-select>
          </v-card-title>
          <v-card-item class="justify-start pa-0">
            <v-card color="teal-lighten-4" class="mx-2 mb-3 border elevation-4" rounded="lg">
              <v-card-title class="ma-2" color="red">{{
                addTypeList.find(t => t.value === addType)?.label || ''
              }}</v-card-title>
              <v-card-item class="pa-0">
                <v-sheet class="d-flex flex-column align-self-start px-2 pb-2 bg-transparent" style="gap: 0.5rem">
                  <v-text-field
                    :label="addType === 'handout' ? '名前' : '名称'"
                    variant="solo"
                    :flat="true"
                    style="width: 20em; max-width: 20em"
                    :persistent-placeholder="true"
                    :hide-details="true"
                  />
                  <v-sheet
                    class="d-flex flex-row flex-wrap bg-transparent"
                    style="gap: 0.5rem"
                    v-if="addType === 'enigma'"
                  >
                    <v-select
                      :items="[1, 2, 3, 4, 5]"
                      label="脅威度"
                      variant="solo"
                      :flat="true"
                      class="align-self-start"
                      :hide-details="true"
                      :persistent-placeholder="true"
                      style="min-width: 5.5em; max-width: 5.5em; gap: 0"
                    />
                    <v-text-field
                      label="解除条件"
                      variant="solo"
                      :flat="true"
                      style="width: 14em; max-width: 14em"
                      :persistent-placeholder="true"
                      :hide-details="true"
                    />
                  </v-sheet>
                  <v-textarea
                    variant="solo"
                    :label="addType === 'enigma' ? '偽装' : '使命'"
                    :editable="true"
                    no-resize
                    :flat="true"
                    class="align-self-start"
                    style="width: 20rem; max-width: 20rem"
                    :persistent-placeholder="true"
                    :hide-details="true"
                    text-rows="5"
                    text=""
                  />
                  <v-textarea
                    :label="addType === 'enigma' ? '効果' : '秘密'"
                    variant="solo"
                    :editable="true"
                    no-resize
                    :flat="true"
                    class="align-self-start"
                    style="width: 20rem; max-width: 20rem"
                    :persistent-placeholder="true"
                    :hide-details="true"
                    text-rows="5"
                    text=""
                  />
                  <v-select
                    :items="graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'handout') || []"
                    item-value="id"
                    variant="solo"
                    :flat="true"
                    item-title="handout.name"
                    label="バインド"
                    class="align-self-start"
                    hide-details
                    style="width: 20rem; max-width: 20rem"
                    persistent-placeholder
                    v-if="addType === 'enigma'"
                  />
                </v-sheet>
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="red" variant="text">削除</v-btn>
                </v-card-actions>
              </v-card-item>
            </v-card>
          </v-card-item>
          <v-card-actions>
            <v-btn variant="flat" color="primary" text="追加"></v-btn>
          </v-card-actions>
        </v-card>
      </v-sheet>
      <v-sheet class="w-100 d-flex flex-wrap"> </v-sheet>
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
import { inject, ref } from 'vue'
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
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

const addType = ref('handout')

const addTypeList = [
  { value: 'handout', label: 'ハンドアウト' },
  { value: 'enigma', label: 'エニグマ' },
  { value: 'persona', label: 'ペルソナ' },
  { value: 'prise', label: 'プライズ' }
]
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
