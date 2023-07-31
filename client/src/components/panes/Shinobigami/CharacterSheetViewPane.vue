<template>
  <pane-frame title="キャラクターシート表示">
    <template v-slot:title-action>
      <v-btn size="x-small" variant="text" class="bg-transparent" icon="mdi-menu" @click="navigationDrawer = !navigationDrawer"></v-btn>
    </template>
    <template v-slot:layout>
      <v-navigation-drawer
        width="200"
        class="mt-8"
        :scrim="false"
        elevation="0"
        border
        location="right"
        style="border-top: none; z-index: 10000000"
        v-model="navigationDrawer"
      >
        <v-list>
          <template v-for="cw in characterWraps">
            <v-list-item>{{ cw.character.characterName }}</v-list-item>
          </template>
        </v-list>
      </v-navigation-drawer>

      <v-sheet
        v-if="graphQlStore"
        class="position-fixed d-flex flex-column bg-transparent"
        style="right: 0; top: 34px; z-index: 10000000000;"
        :height="Math.max(graphQlStore.state.notifications.length * 60 - 10, 0)"
        width="344"
      >
        <template v-for="(notification, idx) in graphQlStore.state.notifications" :key="notification.id">
          <v-snackbar
            class="notify-snackbar"
            variant="flat"
            transition="slide-x-transition"
            :timeout="5000"
            :color="notification.type === 'success' ? 'green' : notification.type === 'warn' ? 'yellow' : 'red'"
            content-class="border rounded-s-xl"
            :contained="true"
            :width="250"
            :model-value="notification.view"
            :style="`margin-bottom: ${idx * 60}px;`"
            @update:model-value="graphQlStore.closeNotification(notification.id)"
          >
            <v-icon :icon="`mdi-${notification.type === 'success' ? 'check' : notification.type === 'warn' ? 'warn' : 'error'}`" />
            {{ notification.text }}{{idx}}
          </v-snackbar>
        </template>
      </v-sheet>
    </template>
    <template v-slot:default>
      <template v-for="cw in characterWraps" :key="cw.id">
        <character-sheet-view
          :character-id="cw.id"
          :player-id="cw.player"
          :character-sheet="cw.character"
          v-model:select-skill="selectSkill"
        />
      </template>
    </template>
  </pane-frame>
</template>

<script lang='ts'>
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name : 'CharacterSheetViewPane',
  label: 'キャラクターシート表示',
}
</script>

<script setup lang='ts'>
import { computed, inject, ref, watch } from 'vue'
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'

import { CharacterWrap, GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import CharacterSheetView from '@/components/panes/Shinobigami/CharacterSheetView.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

const emits = defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
}>()

const navigationDrawer = ref(false)
watch(navigationDrawer, v => {
  if (v) {
    selectSkill.value = ''
  }
})

const characterWraps = computed<CharacterWrap[]>(() => {
  if (!graphQlStore) return []
  return graphQlStore.state.sessionDataList.filter(sd => sd.type === 'character' && sd.data?.character).map(sd => sd.data as CharacterWrap)
})

watch(characterWraps, v => {
  graphQlStore?.addNotification('success', 'aaaaaa')
}, { immediate: true })

const selectSkill = ref('')
watch(selectSkill, v => {
  console.log(v)
  if (v) {
    navigationDrawer.value = false
  }
})

const tokugiTableEditing = ref(false)
watch(tokugiTableEditing, v => {
  console.log(v)
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang='scss' scoped>
.notify-snackbar {
  :deep(.v-snackbar__wrapper) {
    border-radius: 0;
  }
}
</style>
