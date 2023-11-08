<template>
  <pane-frame title="キャラクターシート管理ツール">
    <template v-slot:title-action> </template>
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
          <v-menu
            v-model="readUrlDialog"
            location="bottom right"
            :close-on-content-click="false"
            scroll-strategy="close"
          >
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props">キャラクターシート読込</v-btn>
            </template>
            <v-card>
              <v-card-text class="text-pre-wrap px-2 pb-2 pt-2">
                <v-alert color="light-blue-lighten-4" class="pb-0 pt-2">
                  <v-alert-title>
                    <div class="px-3 rounded-xl mb-2 bg-secondary text-caption font-italic">Tips</div>
                  </v-alert-title>
                  <v-carousel
                    :hide-delimiter-background="true"
                    :show-arrows="false"
                    :progress="false"
                    :interval="11000"
                    :cycle="true"
                    :touch="true"
                    height="100"
                    style="width: 21em"
                    v-model="carouselValue"
                  >
                    <v-defaults-provider
                      :defaults="{
                        VProgressLinear: {
                          color: 'blue-grey-lighten-2',
                          bgOpacity: 0.2,
                          height: 5,
                          rounded: true,
                          roundedBar: true,
                          class: 'mt-3'
                        }
                      }"
                    >
                      <v-carousel-item>
                        <div>
                          <span class="font-weight-bold">人物欄</span>
                          <span>は読み込みません。<br />後で手動で入力してください。</span>
                        </div>
                        <v-progress-linear :model-value="carouselTimerNum" />
                      </v-carousel-item>
                      <v-carousel-item>
                        <div>
                          <span class="font-weight-bold">忍具</span>
                          <span>は読み込みません。</span><br />
                          <span>メモ欄などを使って管理してください。</span>
                        </div>
                        <v-progress-linear :model-value="carouselTimerNum" />
                      </v-carousel-item>
                      <v-carousel-item>
                        <div>
                          <span>秘匿情報閲覧パスは</span>
                          <span class="font-weight-bold">奥義</span>
                          <span>の読込に使います。</span><br />
                          <span>秘匿情報閲覧パスは必須ではありません。</span>
                        </div>
                        <v-progress-linear :model-value="carouselTimerNum" />
                      </v-carousel-item>
                    </v-defaults-provider>
                  </v-carousel>
                </v-alert>
                <v-text-field
                  label="キャラクターシート倉庫のURL"
                  color="primary"
                  class="name-text-field overflow-visible mt-2"
                  :hide-details="true"
                  :persistent-hint="true"
                  :persistent-placeholder="true"
                  placeholder="必須"
                  :flat="true"
                  :autofocus="true"
                  variant="solo-filled"
                  :error-messages="addUrlErrorMessage"
                  v-model="addUrl"
                  @click:append-inner.stop
                  ref="urlElm"
                >
                  <template v-slot:label="{ label }">
                    <v-icon icon="mdi-link-variant" class="mr-1" />
                    {{ label }}
                  </template>
                </v-text-field>
                <v-text-field
                  label="秘匿情報閲覧パス"
                  color="primary"
                  class="name-text-field overflow-visible mt-2"
                  :hide-details="true"
                  :persistent-hint="true"
                  placeholder="オプション"
                  :persistent-placeholder="true"
                  :flat="true"
                  type="password"
                  style="width: 10rem"
                  variant="solo-filled"
                  :error-messages="addUrlErrorMessage"
                  v-model="password"
                  @click:append-inner.stop
                >
                  <template v-slot:label="{ label }">
                    <v-icon icon="mdi-key-outline" class="mr-1" />
                    {{ label }}
                  </template>
                </v-text-field>
              </v-card-text>
              <v-divider />
              <v-card-actions>
                <v-btn
                  variant="text"
                  class="flex-0-1-100 text-decoration-underline"
                  color="primary"
                  @click="readUrlDialog = false"
                  >キャンセル</v-btn
                >
                <v-btn
                  variant="flat"
                  class="flex-0-1-100"
                  color="primary"
                  @click="callAddCharacter()"
                  :disabled="!addUrl"
                  >読込</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-defaults-provider>
      </v-sheet>
    </template>
    <template v-slot:default>
      <v-sheet class="w-100 d-flex flex-row align-start justify-start flex-wrap px-0">
        <scenario-data-card v-for="cw in characterWraps" :key="cw.id" :data-id="cw.id" :text-rows="textRows" />
      </v-sheet>
    </template>
  </pane-frame>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name: 'CharacterSheetManagePane',
  label: 'キャラクターシート管理'
}
</script>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue'
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import { ShinobigamiHelper } from '@/components/panes/Shinobigami/shinobigami'

import { CharacterWrap, GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ScenarioDataCard from '@/components/panes/Shinobigami/ScenarioDataCard.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const characterWraps = computed<CharacterWrap[]>(() => {
  if (!graphQlStore) return []
  return graphQlStore.state.sessionDataList
    .filter(sd => sd.type === 'shinobigami-character' && sd.data?.character)
    .map(sd => sd.data as CharacterWrap)
})

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
const addUrl = ref('')
const password = ref('')
const addUrlErrorMessage = ref('')
async function callAddCharacter() {
  const helper = new ShinobigamiHelper(addUrl.value, password.value)
  if (helper.isThis()) {
    const { data } = await helper.getData()
    await graphQlStore?.addShinobigamiCharacter(data)
  }
}

const readUrlDialog = ref(false)

const carouselTimerNum = ref(0)
const carouselTimer = ref(null)

const carouselValue = ref(0)
const urlElm = ref()
watch(carouselValue, () => {
  carouselTimerNum.value = 0
})
watch(readUrlDialog, v => {
  if (v) {
    carouselTimerNum.value = 0
    carouselValue.value = 0
    addUrl.value = ''
    password.value = ''
    setTimeout(() => urlElm.value?.focus(), 300)
  }
})
onMounted(() => {
  carouselTimer.value = window.setInterval(() => {
    if (carouselTimerNum.value < 100) {
      carouselTimerNum.value += 1
    } else {
      if (carouselValue.value + 1 <= 2) {
        carouselValue.value += 1
      } else {
        carouselValue.value = 0
      }
      carouselTimerNum.value = 0
    }
  }, 100)
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
