<template>
  <v-menu :close-on-content-click="false" width="auto" location="bottom left" v-model="isOpened">
    <template v-slot:activator="{ props }">
      <v-btn
        variant="text"
        class="text-decoration-underline align-self-start"
        text="キャラクターシートから再読込"
        v-bind="props"
      />
    </template>
    <v-card>
      <v-card-item>
        <v-defaults-provider
          :defaults="{
            VSwitch: {
              color: 'primary',
              trueIcon: 'mdi-check',
              hideDetails: true,
              density: 'compact',
              class: 'ml-3 flex-1-1-100',
              style: 'flex-basis: 0 !important'
            },
            VTextField: {
              hideDetails: true,
              persistentPlaceholder: true,
              density: 'compact',
              variant: 'solo-filled',
              flat: true,
              class: 'flex-0-1-100'
            },
            VSheet: { class: 'd-flex flex-row flex-wrap', style: 'width: 19em' }
          }"
        >
          <v-text-field v-model="url" class="mb-2" style="width: 20em">
            <template v-slot:label>
              <v-icon icon="mdi-link-variant" class="mr-1" />
              キャラクターシート倉庫のURL
            </template>
          </v-text-field>
          <v-text-field
            class="mb-2"
            v-model="viewPass"
            :append-icon="viewPassPasswordView ? 'mdi-eye' : 'mdi-eye-off'"
            :type="viewPassPasswordView ? 'text' : 'password'"
            @click:append="viewPassPasswordView = !viewPassPasswordView"
          >
            <template v-slot:label>
              <v-icon icon="mdi-key-outline" class="mr-1" />
              秘匿情報閲覧パス
            </template>
          </v-text-field>
          <v-divider />
          <v-switch
            label="全て"
            :indeterminate="[0, fullDataType.length].every(l => l !== targets.length)"
            :model-value="targets.length === fullDataType.length"
            @update:model-value="v => (targets = v ? clone(fullDataType) : [])"
          />
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
        </v-defaults-provider>
      </v-card-item>
      <v-divider />
      <v-card-actions>
        <v-btn class="flex-0-1-100 text-decoration-underline" variant="text" @click="close()">キャンセル</v-btn>
        <v-btn color="primary" class="flex-0-1-100" variant="flat" :disabled="!targets.length" @click="confirm()"
          >決定</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { fullDataType, mergeShinobigami, ShinobigamiHelper } from '@/components/panes/Shinobigami/shinobigami'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import { clone } from '@/components/panes/Shinobigami/PrimaryDataUtility'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  characterId: string
}>()

const dataObj = computed(() => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
})

const url = ref(dataObj.value.data.character.url)
const viewPass = ref(dataObj.value.data.viewPass)
const viewPassPasswordView = ref(false)
watch(dataObj, v => {
  url.value = v.data.character.url
  viewPass.value = v.data.viewPass
})

const targets = ref<string[]>(clone(fullDataType))
watch(
  targets,
  v => {
    console.log(v)
  },
  { deep: true }
)

const isOpened = ref(false)
watch(isOpened, v => {
  if (v) {
    targets.value = clone(fullDataType)
    viewPassPasswordView.value = false
  }
})

function close() {
  isOpened.value = false
}

async function confirm() {
  const helper = new ShinobigamiHelper(url.value, viewPass.value)
  if (helper.isThis()) {
    const { data } = await helper.getData()
    await graphQlStore?.updateShinobigamiCharacter(
      dataObj.value.id,
      dataObj.value.data.player,
      viewPass.value,
      mergeShinobigami(dataObj.value.data.character, data, targets.value)
    )
    console.log('再読込完了！！！！')
  }
  close()
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
