<template>
  <v-menu :close-on-content-click="false" width="auto" location="bottom left" v-model="opened">
    <template #activator="{ props }">
      <v-btn variant="text" class="align-self-start" v-bind="props">
        <v-icon icon="mdi-reload" />
        <span class="text-decoration-underline">キャラクターシートから再読込</span>
      </v-btn>
    </template>
    <v-card>
      <v-card-text class="d-flex flex-column px-2 pt-2 pb-0" style="gap: 0.5rem">
        <shinobigami-url-form v-model:url="url" v-model:view-pass="viewPass" pass-placeholder="オプション" ref="form" />
        <v-divider />
      </v-card-text>
      <v-defaults-provider
        :defaults="{
          VSwitch: {
            color: 'primary',
            trueIcon: 'mdi-check',
            hideDetails: true,
            persistentHint: true,
            density: 'compact',
            class: 'ml-3 flex-1-1-100',
            style: 'flex-basis: 0 !important'
          },
          VSheet: { class: 'd-flex flex-row flex-wrap', style: 'width: 19em' }
        }"
      >
        <v-sheet class="pa-3 w-100 align-center justify-space-between py-0">
          <span class="text-subtitle-2 flex-grow-0 flex-shrink-1">読込対象</span>
          <v-switch
            class="justify-center flex-grow-0 flex-shrink-1"
            style="flex-basis: auto !important"
            label="全て"
            :indeterminate="[0, fullDataType.length].every(l => l !== targets?.length)"
            :model-value="targets?.length === fullDataType.length"
            @update:model-value="v => (targets = v ? clone(fullDataType) : [])"
          />
        </v-sheet>
        <v-card-text class="px-2 py-0">
          <v-sheet>
            <v-switch label="基本情報" value="basic" v-model="targets" />
            <v-switch label="特技" value="tokugi" v-model="targets" />
          </v-sheet>
          <v-sheet>
            <v-switch label="忍法" value="ninpou" v-model="targets" />
            <v-switch label="背景" value="background" v-model="targets" />
          </v-sheet>
          <v-sheet>
            <v-switch label="奥義" value="specialArts" v-model="targets" />
          </v-sheet>
        </v-card-text>
      </v-defaults-provider>
      <v-card-text class="pt-0" style="max-width: 20rem">
        奥義を再読込すると奥義情報の獲得状況がリセットされます。
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn class="flex-0-1-100 text-decoration-underline" variant="text" @click="close()" text="キャンセル" />
        <v-btn
          color="primary"
          class="flex-0-1-100"
          variant="flat"
          :disabled="!targets?.length"
          @click="confirm()"
          text="決定"
        />
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { DataType, ShinobigamiHelper, fullDataType, mergeShinobigami } from '@/components/panes/Shinobigami/shinobigami'
import { computed, inject, ref, watch } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import { clone } from '@/components/panes/PrimaryDataUtility'
import ShinobigamiUrlForm from '@/components/panes/Shinobigami/ShinobigamiUrlForm.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  characterId: string
}>()

const dataObj = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
})

const url = ref(dataObj.value?.data.character.url || '')
const viewPass = ref(dataObj.value?.data.viewPass || '')
const form = ref()

function resetData() {
  url.value = dataObj.value?.data.character.url || ''
  viewPass.value = dataObj.value?.data.viewPass || ''
}
watch(dataObj, resetData)

const targets = ref(clone<DataType[]>(fullDataType))

const opened = ref(false)
watch(opened, v => {
  if (v) {
    targets.value = clone(fullDataType)
    resetData()
    setTimeout(() => form.value?.focus(), 300)
  }
})

function close() {
  opened.value = false
}

async function confirm() {
  if (!dataObj.value || !targets.value) return
  const helper = new ShinobigamiHelper(url.value, viewPass.value)
  if (helper.isThis()) {
    const { data } = await helper.getData()
    if (data) {
      await graphQlStore?.updateShinobigamiCharacter(
        dataObj.value.id,
        dataObj.value.data.player,
        viewPass.value,
        mergeShinobigami(dataObj.value.data.character, data, targets.value)
      )
      window.logger.info('再読込完了！！！！')
    }
  }
  close()
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
