<template>
  <progress-circular-overlay :modal-value="!graphQlStore?.state.dashboard" color="primary" />
  <share-overlay :modal-value="nav === 'share'" @close="emits('update:nav', '')" />
  <owner-overlay :modal-value="nav === 'owner'" @close="emits('update:nav', '')" />
  <player-overlay :modal-value="Boolean(nav) && ['share', 'owner'].every(s => s !== nav)" @close="emits('update:nav', '')" />

  <v-app-bar density="compact" elevation="1" id="dashboard-main-app-bar">
    <template v-slot:prepend>
      <v-btn
        density="comfortable"
        variant="text"
        :icon="rail ? 'mdi-menu' : 'mdi-backburger'"
        @click="emits('update:rail', !rail)"
        class="my-3 mr-2"
      />
    </template>
    <v-app-bar-title>
      {{ graphQlStore?.state.dashboard?.name || '' }}
      <tooltip-btn-component v-if="isOwnerControl" tooltip-text="名前の編集" btn-icon="mdi-pencil" size="small" />
    </v-app-bar-title>
    <tooltip-btn-component v-if="isOwnerControl" tooltip-text="ペインの編集" btn-icon="mdi-pencil-ruler" @click="showBar = !showBar" />
  </v-app-bar>

  <v-navigation-drawer
    image="/mizuirohaikeit1.jpg"
    :model-value="true"
    :permanent='true'
    location="left"
    :rail="rail"
    id="overlay-abs"
  >
    <v-list :nav='true' density='compact' class="pb-0 pt-0 mb-1">
      <template v-if="isOwnerControl">
        <v-list-item
          variant="flat"
          class="my-1"
          @click="emits('update:nav', nav === 'share' ? '' : 'share')"
          color="primary"
          :active="nav === 'share'"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-share-variant" class="mr-6"></v-icon>
          </template>
          <v-list-item-title>参加してもらう</v-list-item-title>
          <v-list-item-subtitle>オーナー専用</v-list-item-subtitle>
        </v-list-item>
        <v-divider/>
      </template>

      <v-list-subheader class="pa-0 ma-0">{{ !rail ? `オーナー` : '主' }}</v-list-subheader>
      <v-list-item
        class="px-0 py-1 mb-0"
        variant="flat"
        color="primary"
        :active="nav === 'owner'"
        @click="emits('update:nav', nav === 'owner' ? '' : 'owner')"
      >
        <template v-slot:prepend>
          <user-avatar :token="graphQlStore?.state.user!.id" class='mr-3' />
        </template>
        <v-list-item-title>{{graphQlStore?.state.user?.name || ''}}</v-list-item-title>
      </v-list-item>
      <v-divider/>

      <v-list-subheader class="pa-0 ma-0">{{ !rail ? `参加者: ${graphQlStore?.state.players.length || 0}人` : '参' }}</v-list-subheader>
      <template v-for="player in graphQlStore?.state.players" :key="player.id">
        <v-list-item
          class="px-0 py-1 mb-0"
          variant="flat"
          color="primary"
          :active="nav === player.id"
          @click="emits('update:nav', nav === player.id ? '' : player.id)"
        >
          <template v-slot:prepend>
            <user-avatar :token="player.id" class='mr-3' />
          </template>
          <template v-if="!rail">
            <v-list-item-title v-text="player.name || ''" />
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>

  <v-layout v-if="layout" full-height>
    <div class="position-relative w-100 h-100 overflow-hidden">
      <split-panes-layer :blur="layoutChanging" :layout="layout" :root-layout="layout" :show-bar="showBar" />
    </div>
  </v-layout>
</template>

<script setup lang="ts">
import TooltipBtnComponent from '@/components/parts/TooltipBtn.vue'
import ProgressCircularOverlay from '@/components/view-overlay/ProgressCircularOverlay.vue'
import SplitPanesLayer from '@/components/parts/SplitPanesLayer.vue'
import 'splitpanes/dist/splitpanes.css'
import { Layout } from '@/components/panes'
import UserAvatar from '@/components/parts/UserAvatar.vue'
import ShareOverlay from '@/components/view-overlay/ShareOverlay.vue'
import OwnerOverlay from '@/components/view-overlay/OwnerOverlay.vue'
import PlayerOverlay from '@/components/view-overlay/PlayerOverlay.vue'

import { computed, inject, ref, watch } from 'vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  rail: boolean
  nav: string
}>()

const emits = defineEmits<{
  (e: 'update:rail', value: boolean): void
  (e: 'update:nav', value: string): void
}>()

const isOwnerControl = computed(() => Boolean(graphQlStore?.state.user?.token))

const layout = ref<Layout | null>(graphQlStore?.state.dashboard?.layout ? JSON.parse(graphQlStore.state.dashboard.layout) as Layout : null)
const layoutChanging = ref(false)
watch(() => graphQlStore?.state.dashboard?.layout, () => {
  console.log(JSON.stringify(layout.value, null, 2))
  if (graphQlStore?.state.dashboard?.layout) {
    layout.value = JSON.parse(graphQlStore.state.dashboard.layout) as Layout
    layoutChanging.value = false
  } else {
    layoutChanging.value = true
  }
})

const showBar = ref(false)
</script>

<!--suppress HtmlUnknownAttribute, SpellCheckingInspection -->
<style deep lang="scss">
.splitpanes--vertical > .splitpanes__splitter {
  min-width: 7px;
  background: linear-gradient(90deg, #cccccc, #111111);
}

.splitpanes--horizontal > .splitpanes__splitter {
  min-height: 7px;
  background: linear-gradient(#cccccc, #111111);
}
</style>
