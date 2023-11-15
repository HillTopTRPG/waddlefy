<template>
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
    <v-menu v-model="opened" location="bottom left" :close-on-content-click="false" scroll-strategy="close">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props">キャラクターシート読込</v-btn>
      </template>
      <v-card>
        <v-card-text class="d-flex flex-column text-pre-wrap pa-2" style="gap: 0.5rem">
          <v-alert color="light-blue-lighten-4" class="pb-0 pt-2">
            <v-alert-title class="d-flex flex-row justify-space-between pb-2">
              <div class="px-3 rounded-xl bg-secondary text-caption font-italic">Tips</div>
              <v-progress-circular
                :model-value="carouselTimerNum"
                size="x-small"
                color="blue-grey-lighten-2"
                bg-color="transparent"
              />
            </v-alert-title>
            <v-carousel
              :hide-delimiter-background="true"
              :show-arrows="false"
              :progress="false"
              :interval="11000"
              :cycle="true"
              :touch="true"
              height="85"
              style="width: 21em"
              v-model="carouselValue"
            >
              <v-carousel-item>
                <div>
                  <span class="font-weight-bold">人物欄</span>
                  <span>は読み込みません。<br />後で手動で入力してください。</span>
                </div>
              </v-carousel-item>
              <v-carousel-item>
                <div>
                  <span class="font-weight-bold">忍具</span>
                  <span>は読み込みません。</span><br />
                  <span>メモ欄などを使って管理してください。</span>
                </div>
              </v-carousel-item>
              <v-carousel-item>
                <div>
                  <span class="font-weight-bold">シナリオ情報</span>
                  <span>は読み込みません。</span><br />
                  <span>ハンドアウトの追加と紐付けで表現します。</span>
                </div>
              </v-carousel-item>
              <v-carousel-item>
                <div>
                  <span>秘匿情報閲覧パスは</span>
                  <span class="font-weight-bold">奥義</span>
                  <span>の読込に使います。</span><br />
                  <span class="font-weight-bold">忍具</span>
                  <span>は秘匿情報ですが読み込みません。</span>
                </div>
              </v-carousel-item>
            </v-carousel>
          </v-alert>
          <shinobigami-character-sheet-load-form v-model:url="addUrl" v-model:view-pass="password" ref="form" />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn variant="text" class="flex-0-1-100 text-decoration-underline" color="primary" @click="opened = false"
            >キャンセル</v-btn
          >
          <v-btn
            variant="flat"
            class="flex-0-1-100"
            color="primary"
            @click="callAddCharacter()"
            :disabled="!addUrl"
            text="読込"
          />
        </v-card-actions>
      </v-card>
    </v-menu>
  </v-defaults-provider>
</template>

<script setup lang="ts">
import { ShinobigamiHelper } from '@/components/panes/Shinobigami/shinobigami'
import { inject, onMounted, ref, watch } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ShinobigamiCharacterSheetLoadForm from '@/components/panes/Shinobigami/ShinobigamiCharacterSheetLoadForm.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const addUrl = ref('')
const password = ref('')
async function callAddCharacter() {
  const helper = new ShinobigamiHelper(addUrl.value, password.value)
  if (helper.isThis()) {
    const { data } = await helper.getData()
    await graphQlStore?.addShinobigamiCharacter(data, password.value)
  }
  addUrl.value = ''
  password.value = ''
  opened.value = false
}

const opened = ref(false)

const carouselTimerNum = ref(100)
const carouselTimer = ref(null)

const carouselValue = ref(0)
const form = ref()
watch(carouselValue, () => {
  carouselTimerNum.value = 100
})
watch(opened, v => {
  if (v) {
    carouselTimerNum.value = 100
    carouselValue.value = 0
    addUrl.value = ''
    password.value = ''
    setTimeout(() => form.value?.focus(), 300)
  }
})
onMounted(() => {
  carouselTimer.value = window.setInterval(() => {
    if (carouselTimerNum.value > 0) {
      carouselTimerNum.value -= 1
    } else {
      if (carouselValue.value + 1 <= 3) {
        carouselValue.value += 1
      } else {
        carouselValue.value = 0
      }
      carouselTimerNum.value = 100
    }
  }, 100)
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
