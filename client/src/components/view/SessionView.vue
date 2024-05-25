<template>
  <progress-circular-overlay :model-value="!graphQlStore?.state.session" color="primary" />
  <share-overlay :model-value="dialog === 'share'" @close="dialog = ''" />
  <owner-overlay :model-value="dialog === 'owner'" @close="dialog = ''" />
  <setting-overlay :model-value="dialog === 'setting'" @close="dialog = ''" />
  <player-overlay :model-value="['share', 'owner', 'setting'].includes(dialog) ? '' : dialog" @close="dialog = ''" />

  <v-navigation-drawer :permanent="true" location="left" :rail="rail" :elevation="0" id="session-nav">
    <template #prepend>
      <v-list :nav="true" density="compact" class="pa-0 mb-1">
        <v-list-item class="ma-0 sub-nav d-flex">
          <template #prepend>
            <v-btn
              density="comfortable"
              variant="text"
              :icon="rail ? 'mdi-menu' : 'mdi-backburger'"
              @click="onClickExtend()"
              class="mr-2 ml-1"
            />
          </template>
          <template #title>
            <p class="text-h6">{{ graphQlStore?.state.session?.name || '' }}</p>
          </template>
        </v-list-item>
        <v-divider />
      </v-list>
    </template>

    <v-sheet
      class="h-100 overflow-y-auto bg-transparent"
      :class="viewScrollbar ? 'scrollbar-show' : 'scrollbar-hide'"
      v-scroll.self="() => onScroll()"
    >
      <v-list :nav="true" density="compact" class="pa-0 pt-0 mb-1 overflow-y-auto" v-if="sessionType !== 'init'">
        <!-- 画面一覧 -->
        <v-list-subheader class="pa-0 ma-0">画面</v-list-subheader>
        <template v-if="graphQlStore">
          <template v-for="dashboard in graphQlStore.state.dashboards" :key="dashboard.id">
            <user-nav-item
              v-if="isViewDashboard(dashboard.option.scope)"
              :title="dashboard.name"
              :subtitle="dashboardSubtitle(dashboard.option.scope)"
              :rail="rail"
              icon="view-dashboard"
              :toggle="true"
              color="primary"
              :active="dashboardId === dashboard.id"
              @click="changePane(dashboard.id)"
            />
          </template>
        </template>

        <!-- 画面追加 -->
        <v-menu
          v-if="isReady && isUserControl"
          location="right"
          :scrim="true"
          v-model="addDashboardMenu"
          :close-on-content-click="false"
        >
          <template #activator="{ props }">
            <user-nav-item
              v-bind="props"
              title="画面追加"
              subtitle="主催者専用"
              :rail="rail"
              icon="plus"
              :toggle="false"
              class="mt-0 mb-1 mx-2"
            />
          </template>
          <v-card min-width="20em">
            <v-card-title class="bg-secondary">画面追加</v-card-title>
            <v-card-item>
              <v-text-field
                label="画面名"
                placeholder="No title dashboard"
                :autofocus="true"
                v-model="addDashboardName"
                ref="addDashboardNameElm"
                :hide-details="true"
                @keydown.enter="$event.keyCode === 13 && addDashboard()"
              />
            </v-card-item>
            <v-card-actions>
              <v-btn class="d-block flex-grow-1" color="primary" variant="elevated" @click="addDashboard()">確定</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>

        <v-divider />

        <!-- 主催者 -->
        <v-list-subheader class="pa-0 ma-0">主催者</v-list-subheader>
        <user-nav-item
          :title="`${graphQlStore?.state.user?.name || ''}${graphQlStore?.state.user?.token ? ' (あなた)' : ''}`"
          :rail="rail"
          :icon-token="graphQlStore?.state.user!.iconToken"
          :toggle="true"
          color="primary"
          :active="dialog === 'owner'"
          @click="dialog = dialog === 'owner' ? '' : 'owner'"
        />
        <v-divider class="mt-1" />

        <!-- 参加者 -->
        <v-list-subheader class="pa-0 ma-0">{{
          rail ? '参加者' : `参加者: ${graphQlStore?.state.players.length || 0}人`
        }}</v-list-subheader>
        <template v-for="player in graphQlStore?.state.players" :key="player.id">
          <user-nav-item
            :title="`${player.name || ''}${graphQlStore?.state.player?.id === player.id ? ' (あなた)' : ''}`"
            :rail="rail"
            :icon-token="player.iconToken"
            :toggle="true"
            color="primary"
            :active="dialog === player.id"
            @click="selectPlayer(player.id)"
          />
        </template>
      </v-list>
    </v-sheet>

    <nav-dialog
      title="セッションの設定"
      :model-value="dialogInNav === 'setting'"
      @close="dialogInNav = ''"
      class="mb-11 mt-12 session-setting-nav-dialog"
      v-if="isReady"
    >
      <v-list class="nav-dialog h-100">
        <v-list-item>
          <menu-edit-text-field
            :editable="true"
            :width="14"
            label="セッション名"
            :text="inputSessionName"
            @update="updateSessionName"
          />
        </v-list-item>
        <v-list-item class="mt-2" v-if="sessionId">
          <delete-menu-btn
            v-if="(graphQlStore?.state.sessions.length || 0) > 1"
            :target-name="graphQlStore?.state.session?.name || ''"
            type="セッション"
            @execute="graphQlStore?.deleteSession(sessionId)"
          />
          <span class="text-caption" v-else>
            あなたのセッションは１つだけなので、セッションを削除することはできません
          </span>
        </v-list-item>
      </v-list>
    </nav-dialog>

    <template #append>
      <v-list :nav="true" density="compact" class="pa-0 mb-1">
        <v-divider />

        <user-nav-item
          title="参加してもらう"
          subtitle="主催者専用"
          :rail="rail"
          icon="share-variant"
          :toggle="true"
          class="mt-1 mb-0"
          variant="elevated"
          color="orange"
          base-color="orange-lighten-3"
          elevation="0"
          :active="dialog === 'share'"
          @click="dialog = dialog === 'share' ? '' : 'share'"
          v-if="isUserControl && graphQlStore?.state.session?.sessionType !== 'init'"
        />

        <user-nav-item
          title="セッションの選択"
          subtitle="主催者専用"
          v-if="isUserControl"
          :rail="rail"
          icon="home-switch"
          :toggle="false"
          class="mx-1 mt-1 my-0"
          style=""
          color="primary"
          :active="firstRail"
          @click="emits('update:first-rail', !firstRail)"
        />

        <user-nav-item
          v-if="isUserControl"
          title="セッションの設定"
          subtitle="主催者専用"
          :rail="rail"
          icon="home"
          :toggle="false"
          class="mt-1 mb-0"
          color="secondary"
          :active="dialogInNav === 'setting'"
          @click="dialogInNav = dialogInNav === '' ? 'setting' : ''"
        />
      </v-list>
    </template>
  </v-navigation-drawer>

  <v-app-bar density="compact" height="50" :elevation="0" id="session-main-app-bar" v-if="sessionType !== 'init'">
    <span
      class="mx-3 flex-grow-1"
      style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden; box-sizing: border-box"
      >{{ graphQlStore?.state.dashboard?.name || '' }}画面</span
    >
    <v-defaults-provider
      :defaults="{
        VBtn: {
          stacked: true,
          size: 'x-small',
          variant: 'flat',
          class: 'px-1'
        }
      }"
    >
      <v-btn
        prepend-icon="mdi-view-dashboard"
        text="画面の設定"
        value="dialog-setting"
        v-if="isUserControl"
        style="transition-duration: 0s"
        @click="dialog = dialog === 'setting' ? '' : 'setting'"
      />
      <v-btn
        prepend-icon="mdi-pencil-ruler"
        text="レイアウト"
        value="show-bar"
        v-if="isUserControl"
        style="transition-duration: 0s"
        @click="showBar = !showBar"
      />
      <v-btn
        prepend-icon="mdi-brightness-6"
        text="テーマ"
        value="show-bar"
        style="transition-duration: 0s"
        @click="onChangeTheme()"
      />
    </v-defaults-provider>
  </v-app-bar>

  <v-layout full-height class="bg-transparent">
    <div class="main-screen position-relative w-100 h-100 overflow-hidden">
      <split-panes-layer
        :id="dashboardId"
        :layout="layout"
        :root-layout="layout"
        :show-bar="showBar"
        @change-root-layout="onChangeLayout"
        v-if="sessionType !== 'init' && layout"
      />
      <init-session @submit="onSubmitSessionType" v-else-if="sessionType === 'init'" />
    </div>
  </v-layout>

  <v-overlay :model-value="isLoading" class="align-center justify-center">
    <v-progress-circular color="primary" indeterminate size="128" width="20"></v-progress-circular>
  </v-overlay>
</template>

<script setup lang="ts">
import { DEFAULT_DASHBOARD_NAME, GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import NavDialog from '@/components/NavDialog.vue'
import SplitPanesLayer from '@/components/parts/SplitPanesLayer.vue'
import OwnerOverlay from '@/components/view-overlay/OwnerOverlay.vue'
import PlayerOverlay from '@/components/view-overlay/PlayerOverlay.vue'
import ProgressCircularOverlay from '@/components/view-overlay/ProgressCircularOverlay.vue'
import SettingOverlay from '@/components/view-overlay/SettingOverlay.vue'
import ShareOverlay from '@/components/view-overlay/ShareOverlay.vue'
import InitSession from '@/components/view/InitSession.vue'
import 'splitpanes/dist/splitpanes.css'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useTheme } from 'vuetify'

const graphQlStore = inject<GraphQlStore>(GraphQlKey)
const theme = useTheme()

import DeleteMenuBtn from '@/components/DeleteMenuBtn.vue'
import { DashboardOption } from '@/components/graphql/schema'
import { Layout } from '@/components/panes'
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'
import UserNavItem from '@/components/parts/UserNavItem.vue'
import { addDashboards } from '@/PaneLayoutTemplate'
import defaultLayout from '@/PaneLayoutTemplate/DefaultLayout'

const props = defineProps<{
  rail: boolean
  firstRail: boolean
}>()

const emits = defineEmits<{
  (e: 'update:rail', value: boolean): void
  (e: 'update:first-rail', value: boolean): void
}>()

const editSessionName = ref(false)
const isUserControl = computed(() => Boolean(graphQlStore?.state.user?.token))

const sessionId = computed(() => graphQlStore?.state.session?.id)
const dashboardId = computed(() => graphQlStore?.state.dashboard?.id)
const sessionType = computed(() => graphQlStore?.state.session?.sessionType)
const layout = computed(() => graphQlStore?.state.dashboard?.layout)
watch([sessionId, dashboardId], () => {
  dialog.value = ''
  dialogInNav.value = ''
})

const showBar = ref(false)
const inputSessionName = ref(graphQlStore?.state.session?.name || '')
watch(
  () => graphQlStore?.state.session?.name,
  () => {
    inputSessionName.value = graphQlStore?.state.session?.name || ''
  }
)

async function updateSessionName(value: string) {
  const session = graphQlStore?.state.session
  if (!session) return
  await graphQlStore?.updateSession(value, session.sessionType, session.defaultDashboardId)
  editSessionName.value = false
}

const dialog = ref('')
const dialogInNav = ref('')
const saveRail = ref(false)
watch(dialogInNav, v => {
  if (v) {
    saveRail.value = props.rail
    emits('update:rail', false)
  } else {
    emits('update:rail', saveRail.value)
  }
})

function onClickExtend() {
  if (dialogInNav.value) {
    saveRail.value = !props.rail
    dialogInNav.value = ''
  } else {
    emits('update:rail', !props.rail)
  }
}

const isReady = ref(false)
onMounted(() => {
  isReady.value = true
})

async function onSubmitSessionType(sessionType: string): Promise<void> {
  if (!graphQlStore) return
  await addDashboards(graphQlStore, sessionType)
}

async function addDashboard() {
  if (!graphQlStore) return
  const beforeDashboards = graphQlStore?.state.dashboards.map(d => d.id)
  await graphQlStore.addDashboard(addDashboardName.value, defaultLayout, { scope: 'all' })
  const getNewDashboard = (): Promise<string> => {
    return new Promise((resolve: (newDashboardId: string) => void) => {
      const timerId = setInterval(() => {
        const newDashboard = graphQlStore.state.dashboards.find(ad => !beforeDashboards?.includes(ad.id))
        if (newDashboard) {
          clearInterval(timerId)
          resolve(newDashboard.id)
        }
      }, 100)
    })
  }
  const newDashboardId = await getNewDashboard()
  addDashboardName.value = DEFAULT_DASHBOARD_NAME
  addDashboardMenu.value = false
  await graphQlStore.directDashboardAccess(newDashboardId)
}

const addDashboardNameElm = ref()
const addDashboardName = ref(DEFAULT_DASHBOARD_NAME)
const addDashboardMenu = ref(false)
watch(addDashboardMenu, () => {
  if (addDashboardMenu.value) {
    setTimeout(() => {
      addDashboardNameElm.value.focus()
    }, 100)
  }
})

async function onChangeLayout(layout: Layout) {
  if (!graphQlStore) return
  await graphQlStore.updateDashboardLayout(layout)
}

function selectPlayer(playerId: string) {
  if (dialog.value === playerId) {
    dialog.value = ''
    return
  }
  dialog.value = ''
  setTimeout(() => {
    dialog.value = playerId
  }, 100)
}

const bNavVal = ref<string[]>([])
watch(bNavVal, v => {
  const a = v.includes('show-bar')
  const b = showBar.value
  if ((a && !b) || (!a && b)) showBar.value = !showBar.value

  const c = v.includes('dialog-setting')
  const d = dialog.value === 'setting'
  if (c && !d) dialog.value = 'setting'
  else if (!c && d) dialog.value = ''
})
watch(dialog, v => {
  const idx = bNavVal.value.findIndex(s => s === 'dialog-setting')
  if (v === 'setting' && idx < 0) {
    bNavVal.value.push('dialog-setting')
  } else if (v !== 'setting' && idx >= 0) {
    bNavVal.value.splice(idx, 1)
  }
})

function isViewDashboard(scope: DashboardOption['scope']): boolean {
  if (scope === 'all' || Boolean(graphQlStore?.state.user?.token)) return true
  if (scope === 'owner') return false
  return scope.includes(graphQlStore?.state.player?.id || '')
}

function dashboardSubtitle(scope: DashboardOption['scope']): string {
  if (scope === 'all') return ''
  if (scope === 'owner') return '主催者専用'
  if (!graphQlStore) return ''
  return graphQlStore.state.players
    .filter(p => scope.includes(p.id))
    .map(p => p.name)
    .join(', ')
}

const isLoading = ref(false)

async function changePane(nextDashboardId: string) {
  if (dashboardId.value === nextDashboardId) return
  isLoading.value = true
  await graphQlStore?.changeDashboard(nextDashboardId)
  isLoading.value = false
}

const scrollTimeout = ref<number | null>(null)
const viewScrollbar = ref(false)

function onScroll() {
  viewScrollbar.value = true
  if (scrollTimeout.value !== null) {
    window.clearTimeout(scrollTimeout.value)
    scrollTimeout.value = null
  }
  scrollTimeout.value = window.setTimeout(() => {
    viewScrollbar.value = false
  }, 500)
}

async function onChangeTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  localStorage.setItem('dark', (theme.global.name.value === 'dark').toString())
}
</script>

<style scoped lang="scss">
.nav-dialog {
  background-image: url('/paint_00003.jpg');
  background-color: rgba(255, 255, 255, 0.5);
  background-blend-mode: lighten;
}

#session-nav:deep(.v-navigation-drawer__content) {
  display: flex !important;
  flex-direction: column !important;
  overflow-y: auto;
}

.splitpanes--vertical > .splitpanes__splitter {
  min-width: 7px;
  background: linear-gradient(90deg, #cccccc, #111111);
}

.splitpanes--horizontal > .splitpanes__splitter {
  min-height: 7px;
  background: linear-gradient(#cccccc, #111111);
}

.name-text-field {
  align-self: stretch;
  grid-template-columns: repeat(auto-fill, 1fr);
  grid-template-rows: 1fr auto;
}

.name-text-field:deep(.v-field--appended) {
  padding-inline-end: 0;
}

.name-text-field:deep(.v-field__input),
.name-text-field:deep(.v-field__append-inner) {
  padding-top: 0;
}

.name-text-field:deep(.v-field__input) {
  min-height: auto;
  height: 100%;
  letter-spacing: 0;
}

.v-navigation-drawer :deep(.v-navigation-drawer__content) {
  max-width: initial;
}
.v-navigation-drawer > :deep(*) {
  margin-right: -1px;
}

.main-screen {
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  &::before {
    z-index: -1;
    backdrop-filter: blur(3px);
  }

  &::after {
    z-index: -2;
    background-color: transparent;
    background-repeat: repeat;
  }
}
</style>
