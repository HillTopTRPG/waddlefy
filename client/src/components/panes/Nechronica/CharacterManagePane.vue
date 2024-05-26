<template>
  <pane-frame :title="$t('Nechronica.label.character-manage-tool-pane-title')">
    <template #title-action>
      <perspective-select v-model="perspective" />
    </template>
    <template #layout>
      <v-sheet class="d-flex flex-row flex-wrap w-100 pa-2 bg-transparent" style="gap: 0.3rem">
        <template v-for="type in nechronicaTypes" :key="type">
          <url-form-menu
            v-if="!perspective || type === 'doll'"
            :text="
              $t('Nechronica.label.loading-of').replace(
                '$$',
                $t(mapping.CHARACTER_TYPE.find(tp => tp.type === type)?.text || 'Nechronica.CHARACTER_TYPE.none')
              )
            "
            :color="getCharacterTypeColor(type)"
            @execute="url => onLoadCharacterSheet(url, type)"
            :tips="[]"
          />
        </template>
      </v-sheet>
    </template>
    <template #default>
      <v-sheet class="d-flex flex-row flex-wrap align-start w-100 px-2 pb-2 bg-transparent" style="gap: 0.5rem">
        <template v-for="character in characters.filter(c => c.data.type === 'doll')" :key="character.id">
          <manage-character-sheet-card :perspective="perspective" :character="character" />
        </template>
        <template v-for="character in characters.filter(c => c.data.type === 'savant')" :key="character.id">
          <manage-character-sheet-card
            :perspective="perspective"
            v-if="!perspective || !character.data.hide"
            :character="character"
          />
        </template>
        <template v-for="character in characters.filter(c => c.data.type === 'horror')" :key="character.id">
          <manage-character-sheet-card
            :perspective="perspective"
            v-if="!perspective || !character.data.hide"
            :character="character"
          />
        </template>
        <template v-for="character in characters.filter(c => c.data.type === 'legion')" :key="character.id">
          <manage-character-sheet-card
            :perspective="perspective"
            v-if="!perspective || !character.data.hide"
            :character="character"
          />
        </template>
      </v-sheet>
      <sponsorship />
    </template>
    <template #nav></template>
  </pane-frame>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})

export const componentInfo = {
  name: 'CharacterManagePane',
  label: 'キャラクター管理'
}
</script>

<script setup lang="ts">
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'
import { computed, inject, ref } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import ManageCharacterSheetCard from '@/components/panes/Nechronica/character/ManageCharacterSheetCard.vue'
import PerspectiveSelect from '@/components/panes/Nechronica/component/PerspectiveSelect.vue'
import UrlFormMenu from '@/components/panes/Nechronica/component/UrlFormMenu.vue'
import Sponsorship from '@/components/panes/Nechronica/component/sponsorship.vue'
import mapping from '@/components/panes/Nechronica/mapping.json'
import { NechronicaHelper, NechronicaType, NechronicaWrap } from '@/components/panes/Nechronica/nechronica'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'

const theme = useTheme()

const graphQlStore = inject<GraphQlStore>(GraphQlKey)
const isUserControl = computed(() => Boolean(graphQlStore?.state.user?.token))
const { t } = useI18n()

defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
}>()

const perspective = ref<string>(isUserControl.value ? '' : graphQlStore?.state.player?.id || '')

const characters = computed((): { id: string; data: NechronicaWrap }[] => {
  return graphQlStore?.state.sessionDataList.filter(sd => sd.type === 'nechronica-character') || []
})

async function onLoadCharacterSheet(url: string, type: NechronicaType) {
  const helper = new NechronicaHelper(url, t)
  if (helper.isThis()) {
    const { data } = await helper.getData()
    if (!data) {
      graphQlStore?.addNotification(
        t('Nechronica.label.failed-loading-character-sheet'),
        'mdi-alert-circle-outline',
        'error'
      )
      return
    }
    window.logger.info(JSON.stringify(data, null, 2))
    await graphQlStore?.addNechronicaCharacter(perspective.value, type, data, {})
  }
}

const nechronicaTypes: NechronicaType[] = ['doll', 'savant', 'horror', 'legion']

function getCharacterTypeColor(type: string) {
  return (mapping.CHARACTER_TYPE.find(tp => tp.type === type)?.color as any)[theme.global.name.value] || ''
}
</script>

<style lang="scss" scoped></style>
