<template>
  <v-sheet class="ma-3 d-flex flex-column bg-transparent" max-width="40em">
    <v-sheet class="d-flex flex-row bg-transparent mb-2 align-center w-100">
      <p class="text-h5">新しいセッションへようこそ！</p>
      <v-spacer />
      <!-- テーマ -->
      <v-btn icon="mdi-brightness-6" size="small" class="no-transition" @click="onChangeTheme()" />
    </v-sheet>

    <v-card class="mb-4" variant="text" density="compact" elevation="4" max-width="30em">
      <v-card-title class="bg-secondary pb-1 pt-3 px-0">
        <v-select
          class="session-type-select"
          :items="items"
          v-model="sessionType"
          item-value="val"
          item-title="label"
          :hide-details="true"
          :persistent-hint="true"
          density="compact"
          variant="plain"
        >
          <template #label><span class="px-3">セッションタイプを選んでください</span></template>
        </v-select>
      </v-card-title>
      <v-card-text>
        <p class="mt-3">{{ items.find(item => item.val === sessionType)?.text || '' }}</p>
      </v-card-text>
    </v-card>
    <v-defaults-provider :defaults="{ VAlert: vAlertDefault }">
      <v-alert type="info" text="選択肢は今後のバージョンアップによって増える可能性があります" />
    </v-defaults-provider>
    <v-defaults-provider :defaults="{ VAlert: vAlertDefault }">
      <v-alert type="warning" text="一度決定するとセッションのタイプは後から変更できません" />
    </v-defaults-provider>
    <v-btn
      color="primary"
      class="align-self-start"
      @click="emits('submit', sessionType)"
      :text="$t('label.decision')"
    />
  </v-sheet>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()

const emits = defineEmits<{
  (e: 'submit', sessionType: string): void
}>()

const items = [
  { label: 'シノビガミ', val: 'Shinobigami', text: '忍術バトルRPG シノビガミを遊ぶのに適しています。' },
  { label: 'ネクロニカ', val: 'Nechronica', text: '永い後日談のネクロニカを遊ぶのに適しています。' }
]

const sessionType = ref('Shinobigami')

const vAlertDefault = {
  border: 'start',
  density: 'compact',
  elevation: '2',
  class: 'mb-3',
  variant: 'tonal'
}

async function onChangeTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  localStorage.setItem('dark', (theme.global.name.value === 'dark').toString())
}
</script>

<style scoped lang="scss">
.session-type-select:deep(.v-field) {
  padding-left: 12px;
  padding-right: 12px;
}
.session-type-select:deep(.v-input__details) {
  padding-left: 12px;
  padding-right: 12px;
}
</style>
