<template>
  <v-menu :close-on-content-click="false" width="auto" location="bottom left" v-model="opened">
    <template #activator="{ props }">
      <v-btn variant="text" v-bind="props">
        <v-icon icon="mdi-reload" />
        <span class="text-decoration-underline">{{ $t('Nechronica.label.reload-character-sheet') }}</span>
      </v-btn>
    </template>
    <v-card>
      <v-card-text class="d-flex flex-column px-2 pt-2 pb-0" style="gap: 0.5rem">
        <url-form v-model:url="url" ref="form" />
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
          <span class="text-subtitle-2 flex-grow-0 flex-shrink-1">{{ $t('Nechronica.label.loading-target') }}</span>
          <v-switch
            class="justify-center flex-grow-0 flex-shrink-1"
            style="flex-basis: auto !important"
            :label="$t('label.all')"
            :indeterminate="[0, fullDataType.length].every(l => l !== targets?.length)"
            :model-value="targets?.length === fullDataType.length"
            @update:model-value="v => (targets = v ? clone(fullDataType) : [])"
          />
        </v-sheet>
        <v-card-text class="px-2 py-0">
          <v-switch :label="$t('Nechronica.label.maneuver')" value="maneuver" v-model="targets" />
          <v-switch :label="$t('Nechronica.label.roice')" value="roice" v-model="targets" />
          <v-switch :label="$t('Nechronica.label.personal-data')" value="basic" v-model="targets" />
        </v-card-text>
      </v-defaults-provider>
      <v-divider />
      <v-card-actions>
        <v-btn
          class="flex-0-1-100 text-decoration-underline"
          variant="text"
          @click="close()"
          :text="$t('label.cancel')"
        />
        <v-btn
          color="primary"
          class="flex-0-1-100"
          variant="flat"
          :disabled="!targets?.length"
          @click="confirm()"
          :text="$t('label.decision')"
        />
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import UrlForm from '@/components/panes/Nechronica/component/UrlForm.vue'
import {
  DataType,
  NechronicaHelper,
  NechronicaWrap,
  fullDataType,
  mergeNechronica
} from '@/components/panes/Nechronica/nechronica'
import { clone } from '@/components/panes/PrimaryDataUtility'
import { computed, inject, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const graphQlStore = inject<GraphQlStore>(GraphQlKey)
const { t } = useI18n()

const props = defineProps<{
  characterId: string
}>()

const dataObj = computed((): { id: string; data: NechronicaWrap } | undefined => {
  return graphQlStore?.state.sessionDataList.find(sd => sd.id === props.characterId)
})

const url = ref(dataObj.value?.data.character.url || '')
const form = ref()

function resetData() {
  url.value = dataObj.value?.data.character.url || ''
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
  const helper = new NechronicaHelper(url.value, t)
  if (helper.isThis()) {
    const { data } = await helper.getData()
    if (data) {
      await graphQlStore?.updateNechronicaCharacterHelper(dataObj.value.id, c => {
        c.character = mergeNechronica(dataObj.value!.data.character, data, targets.value!)
      })
      window.logger.info('再読込完了！！！！')
    }
  }
  close()
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
