<template>
  <progress-circular-overlay :modal-value="!graphQlStore?.state.session" color="primary" />
  <share-overlay :modal-value="nav === 'share'" @close="emits('update:nav', '')" />
  <owner-overlay :modal-value="nav === 'owner'" @close="emits('update:nav', '')" />
  <setting-overlay :modal-value="nav === 'setting'" @close="emits('update:nav', '')" />
  <player-overlay :modal-value="Boolean(nav) && ['share', 'owner', 'setting'].every(s => s !== nav)" @close="emits('update:nav', '')" />

  <v-navigation-drawer
    :permanent='true'
    location="left"
    :rail="rail"
    :elevation="0"
    id="session-nav"
    ref="sessionNav"
  >
    <template v-slot:prepend>
      <v-list :nav='true' density='compact' class="pa-0 mb-1">
        <v-list-item class="ma-0 sub-nav d-flex">
          <template v-slot:prepend>
            <v-btn
              density="comfortable"
              variant="text"
              :icon="rail ? 'mdi-menu' : 'mdi-backburger'"
              @click="onClickExtend()"
              class="mr-2"
            />
          </template>
        </v-list-item>
        <v-divider />
      </v-list>
    </template>

    <!-- 画面 -->
    <v-list :nav='true' density='compact' class="pa-0 pt-0 mb-1" @scroll="onScroll($event)">
      <v-list-item
        class="mt-0 mb-1 ml-2"
        style="border-radius: 10px 0 0 10px;"
        value="1"
      >
        <template v-slot:prepend>
          <v-icon icon="mdi-view-dashboard" class="mr-6" />
        </template>
        <v-list-item-title v-if="!rail">aaaaa</v-list-item-title>
      </v-list-item>
      <v-list-item
        class="mt-0 mb-1 ml-2"
        style="border-radius: 10px 0 0 10px;"
        value="2"
      >
        <template v-slot:prepend>
          <v-icon icon="mdi-plus" class="mr-6" />
        </template>
        <v-list-item-title v-if="!rail">画面追加</v-list-item-title>
        <v-list-item-subtitle v-if="!rail">主催者専用</v-list-item-subtitle>
      </v-list-item>
      <v-divider/>
    </v-list>

    <!-- 主催者 -->
    <v-list :nav='true' if="account-list-nav" density='compact' class="pa-0 pt-0 mb-1">
      <v-list-subheader class="pa-0 ma-0">主催者</v-list-subheader>
      <v-list-item
        class="pl-2 pr-0 py-1 ml-2 mb-0"
        style="border-radius: 10px 0 0 10px;"
        variant="flat"
        color="primary"
        :active="nav === 'owner'"
        @click="emits('update:nav', nav === 'owner' ? '' : 'owner')"
      >
        <template v-slot:prepend>
          <user-avatar :token="graphQlStore?.state.user!.iconToken || ''" class='mr-3' />
        </template>
        <v-list-item-title>{{graphQlStore?.state.user?.name || ''}}</v-list-item-title>
      </v-list-item>
      <v-divider class="mt-1" />

      <!-- 参加者 -->
      <v-list-subheader class="pa-0 ma-0">参加者{{ rail ? '' : `: ${graphQlStore?.state.players.length || 0}人` }}</v-list-subheader>
      <template v-for="player in graphQlStore?.state.players" :key="player.id">
        <v-list-item
          class="pl-2 pr-0 py-1 ml-2"
          style="border-radius: 10px 0 0 10px;"
          variant="flat"
          color="primary"
          :active="nav === player.id"
          @click="emits('update:nav', nav === player.id ? '' : player.id)"
        >
          <template v-slot:prepend>
            <user-avatar :token="player.iconToken" class='mr-3' />
          </template>
          <template v-if="!rail">
            <v-list-item-title v-text="player.name || ''" />
          </template>
        </v-list-item>
      </template>
    </v-list>

    <template v-slot:append>
      <v-list :nav='true' density='compact' class="pa-0 my-1" v-if="!isScrolling">
        <v-divider />
        <v-list-item
          variant="flat"
          class="mt-1 mb-0 ml-2"
          style="border-radius: 10px 0 0 10px;"
          @click="emits('update:nav', nav === 'share' ? '' : 'share')"
          base-color="orange"
          :ripple="true"
          :active="nav === 'share'"
          v-if="isOwnerControl"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-share-variant" class="mr-6" />
          </template>
          <v-list-item-title>参加してもらう</v-list-item-title>
          <v-list-item-subtitle>主催者専用</v-list-item-subtitle>
        </v-list-item>

        <v-list-item
          variant="flat"
          class="mt-1 mb-0 mx-2"
          :ripple="true"
          color="secondary"
          :active="dialog === 'setting'"
          @click="dialog = dialog === '' ? 'setting' : ''"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-cog" class="mr-6" />
          </template>
          <span style="white-space: nowrap;">{{ graphQlStore?.state.session?.name || '' }}</span>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>

  <session-nav-dialog
    v-if="isReady"
    title="セッションの設定"
    :modal-value="dialog === 'setting'"
    @update:modal-value="v => { dialog = v ? 'setting' : '' }"
  >
    <v-list>
      <v-list-subheader style="min-height: auto">セッション名</v-list-subheader>
      <v-list-item
        variant="flat"
        class="mb-0"
        style="border-radius: 10px 0 0 10px;"
        :ripple="true"
        :active="nav === 'share'"
      >
        <v-text-field
          :readonly="!editSessionName"
          label=""
          v-model="inputSessionName"
          placeholder="セッション名"
          color="primary"
          variant="plain"
          density="compact"
          class="name-text-field"
          style="letter-spacing: 1em; min-height: 1em"
          hide-details
          ref="sessionNameInputElm"
          @keydown.enter="$event.keyCode === 13 && updateSessionName()"
          @click:append-inner.stop
        >
          <template v-slot:append-inner v-if="isOwnerControl">
            <v-divider :vertical="true" />
            <v-defaults-provider :defaults="{ VBtn: { stacked: true, variant: 'text', size: 'x-small' } }">
              <v-btn
                v-if="editSessionName"
                :disabled="!inputSessionName"
                prepend-icon="mdi-check-bold"
                text="決定"
                class="bg-transparent h-100 px-1"
                @click.prevent.stop="updateSessionName()"
                @mousedown.prevent.stop
                @mouseup.prevent.stop
              />
              <v-btn
                v-else
                prepend-icon="mdi-pencil"
                text="編集"
                class="bg-transparent h-100 px-1"
                @click.prevent.stop="startEditSessionName()"
                @mousedown.prevent.stop
                @mouseup.prevent.stop
              />
            </v-defaults-provider>
          </template>
        </v-text-field>
      </v-list-item>
    </v-list>
    <v-divider />
    <v-list>
      <v-list-subheader>General</v-list-subheader>
    </v-list>
  </session-nav-dialog>

  <v-app-bar density="compact" height="50" elevation="0" id="session-main-app-bar">
    <v-defaults-provider :defaults="{ VBtn: { stacked: true, size: 'x-small', variant: 'flat' } }">
      <v-btn prepend-icon="mdi-cog" text="設定" @click="emits('update:nav', nav === 'setting' ? '' : 'setting')" />
    </v-defaults-provider>
    <template v-slot:append>
      <v-defaults-provider :defaults="{ VBtn: { stacked: true, size: 'x-small', variant: 'flat' } }">
        <v-btn prepend-icon="mdi-pencil-ruler" text="レイアウト" @click="showBar = !showBar" />
      </v-defaults-provider>
    </template>
  </v-app-bar>

  <v-layout v-if="layout" full-height>
    <div class="position-relative w-100 h-100 overflow-hidden">
      <split-panes-layer :blur="layoutChanging" :layout="layout" :root-layout="layout" :show-bar="showBar" />
    </div>
  </v-layout>
</template>

<script setup lang="ts">
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
import SessionNavDialog from '@/components/SessionNavDialog.vue'
import SettingOverlay from '@/components/view-overlay/SettingOverlay.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  rail: boolean
  nav: string
}>()

const emits = defineEmits<{
  (e: 'update:rail', value: boolean): void
  (e: 'update:nav', value: string): void
}>()

const sessionNav = ref()
const isScrolling = ref(false)
watch(sessionNav, () => {
  if (!sessionNav.value) return
  const scrollParentElm = sessionNav.value.$el.parentElement
    .querySelectorAll('.v-navigation-drawer__content')[0]
  scrollParentElm.addEventListener('scroll', event => {
    const scrollTop = event.target.scrollTop
    isScrolling.value = scrollTop > 0
  })
})

const editSessionName = ref(false)
const isOwnerControl = computed(() => Boolean(graphQlStore?.state.user?.token))

const layout = ref<Layout | null>(graphQlStore?.state.session?.layout ? JSON.parse(graphQlStore.state.session.layout) as Layout : null)
const layoutChanging = ref(false)
watch(() => graphQlStore?.state.session?.layout, () => {
  console.log(JSON.stringify(layout.value, null, 2))
  if (graphQlStore?.state.session?.layout) {
    layout.value = JSON.parse(graphQlStore.state.session.layout) as Layout
    layoutChanging.value = false
  } else {
    layoutChanging.value = true
  }
})

const showBar = ref(false)
const inputSessionName = ref(graphQlStore?.state.session?.name || '')
watch(() => graphQlStore?.state.session?.name, () => {
  inputSessionName.value = graphQlStore?.state.session?.name
})

async function updateSessionName() {
  const session = graphQlStore?.state.session
  if (!session) return
  await graphQlStore?.updateSession(inputSessionName.value, session.layout, session.metaData)
  editSessionName.value = false
}

function onScroll(event: any) {
  console.log(event)
}

const dialog = ref('')
const saveRail = ref(false)
watch(dialog, () => {
  if (dialog.value) {
    saveRail.value = props.rail
    emits('update:rail', false)
  } else {
    emits('update:rail', saveRail.value)
  }
})

function onClickExtend() {
  if (dialog.value) {
    saveRail.value = !props.rail
    dialog.value = ''
  } else {
    emits('update:rail', !props.rail)
  }
}

const isReady = ref(false)
setTimeout(() => {
  isReady.value = true
}, 500)

const sessionNameInputElm = ref()
function startEditSessionName() {
  editSessionName.value = true
  setTimeout(() => {
    sessionNameInputElm.value.focus()
  }, 100)
}
</script>

<!--suppress HtmlUnknownAttribute, SpellCheckingInspection -->
<style scoped lang="scss">
.splitpanes--vertical > .splitpanes__splitter {
  min-width: 7px;
  background: linear-gradient(90deg, #cccccc, #111111);
}

.splitpanes--horizontal > .splitpanes__splitter {
  min-height: 7px;
  background: linear-gradient(#cccccc, #111111);
}

.sub-nav:deep(.v-list-item__content) {
  display: flex;
  flex: 1;
  align-self: stretch;
}

.name-text-field {
  align-self: stretch;
  grid-template-columns: repeat(auto-fill, 1fr);
  grid-template-rows: 1fr auto;
}

.name-text-field:deep(.v-field--appended) {
  padding-inline-end: 0
}

.name-text-field:deep(.v-field__input),
.name-text-field:deep(.v-field__append-inner) {
  padding-top: 0
}

.name-text-field:deep(.v-field__input) {
  min-height: auto;
  height: 100%;
  letter-spacing: 0;
}
</style>
