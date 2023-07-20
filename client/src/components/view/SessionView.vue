<template>
  <progress-circular-overlay :modal-value="!graphQlStore?.state.session" color="primary" />
  <share-overlay :modal-value="dialog === 'share'" @close="dialog = ''" />
  <owner-overlay :modal-value="dialog === 'owner'" @close="dialog = ''" />
  <setting-overlay :modal-value="dialog === 'setting'" @close="dialog = ''" />
  <player-overlay :modal-value="Boolean(dialog) && ['share', 'owner', 'setting'].every(s => s !== dialog)" @close="dialog = ''" />

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
          <template v-slot:title>
            <p class="text-h6">{{ graphQlStore?.state.session?.name || '' }}</p>
          </template>
        </v-list-item>
        <v-divider />
      </v-list>
    </template>

    <!-- 画面 -->
    <v-list :nav='true' density='compact' class="pa-0 pt-0 mb-1" @scroll="onScroll($event)" v-if="sessionType !== 'init'">
      <template v-if="graphQlStore">
        <template v-for="dashboard in graphQlStore.state.dashboards" :key="dashboard.id">
          <user-nav-item
            :title="dashboard.name"
            :rail="rail"
            icon="view-dashboard"
            :toggle="true"
            color="primary"
            :active="dashboardId === dashboard.id"
            @click="dashboardId !== dashboard.id && graphQlStore?.directDashboardAccess(dashboard.id)"
          />
        </template>
      </template>
      <v-menu v-if="isReady" location="right" :scrim="true" v-model="addDashboardMenu" :close-on-content-click="false">
        <template v-slot:activator="{ props }">
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
              hide-details
              @keydown.enter="$event.keyCode === 13 && addDashboard()"
            />
          </v-card-item>
          <v-card-actions>
            <v-btn class="d-block flex-grow-1" color="primary" variant="elevated" @click="addDashboard()">確定</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
      <v-divider/>
    </v-list>

    <!-- 主催者 -->
    <v-list :nav='true' if="account-list-nav" density='compact' class="pa-0 pt-0 mb-1">
      <v-list-subheader class="pa-0 ma-0">主催者</v-list-subheader>

      <user-nav-item
        :title="graphQlStore?.state.user?.name || ''"
        :rail="rail"
        :icon-token="graphQlStore?.state.user!.iconToken"
        :toggle="true"
        color="primary"
        :active="dialog === 'owner'"
        @click="dialog = dialog === 'owner' ? '' : 'owner'"
      />
      <v-divider class="mt-1" />

      <!-- 参加者 -->
      <v-list-subheader class="pa-0 ma-0">参加者{{ rail ? '' : `: ${graphQlStore?.state.players.length || 0}人` }}</v-list-subheader>
      <template v-for="player in graphQlStore?.state.players" :key="player.id">
        <user-nav-item
          :title="player.name || ''"
          :rail="rail"
          :icon-token="player.iconToken"
          :toggle="true"
          color="primary"
          :active="dialog === player.id"
          @click="selectPlayer(player.id)"
        />
      </template>
    </v-list>

    <template v-slot:append>
      <v-list :nav='true' density='compact' class="pa-0 my-1" v-if="!isScrolling">
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
          v-if="isOwnerControl && graphQlStore?.state.session?.sessionType !== 'init'"
        />

        <user-nav-item
          title="セッションの設定"
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

  <nav-dialog
    title="セッションの設定"
    attach="#session-nav"
    :modal-value="dialogInNav === 'setting'"
    @close="dialogInNav = ''"
    class="mb-11 mt-12"
    v-if="isReady"
  >
    <v-list class="nav-dialog h-100">
      <v-list-subheader style="min-height: auto; background: none;">セッション名</v-list-subheader>
      <v-list-item>
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
      <v-list-item class="mt-2" v-if="graphQlStore?.state.sessions.length > 1">
        <delete-dialog-btn
          :target-name="graphQlStore?.state.session?.name || ''"
          type="セッション"
          :sessionId="sessionId"
          @execute="graphQlStore?.deleteSession(sessionId)"
        />
      </v-list-item>
    </v-list>
  </nav-dialog>

  <v-app-bar density="compact" height="50" :elevation="0" id="session-main-app-bar" v-if="sessionType !== 'init'">
    <span class="mx-3">{{ graphQlStore?.state.dashboard?.name || '' }}</span>
    <v-defaults-provider :defaults="{ VBtn: { stacked: true, size: 'x-small', variant: 'flat' } }">
      <v-btn prepend-icon="mdi-view-dashboard" text="画面の設定" value="dialog-setting" @click="dialog = dialog === 'setting' ? '' : 'setting'" />
      <v-btn prepend-icon="mdi-pencil-ruler" text="レイアウト" value="show-bar" @click="showBar = !showBar" />
    </v-defaults-provider>
  </v-app-bar>

  <v-layout full-height>
    <div class="position-relative w-100 h-100 overflow-hidden">
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
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue'
import ProgressCircularOverlay from '@/components/view-overlay/ProgressCircularOverlay.vue'
import SplitPanesLayer from '@/components/parts/SplitPanesLayer.vue'
import 'splitpanes/dist/splitpanes.css'
import ShareOverlay from '@/components/view-overlay/ShareOverlay.vue'
import OwnerOverlay from '@/components/view-overlay/OwnerOverlay.vue'
import PlayerOverlay from '@/components/view-overlay/PlayerOverlay.vue'
import SettingOverlay from '@/components/view-overlay/SettingOverlay.vue'
import InitSession from '@/components/view/InitSession.vue'
import NavDialog from '@/components/NavDialog.vue'

import { DEFAULT_DASHBOARD_NAME, GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

import { Layout } from '@/components/panes'
import defaultLayout from '@/PaneLayoutTemplate/DefaultLayout'
import UserNavItem from '@/components/parts/UserNavItem.vue'
import DeleteDialogBtn from '@/components/DeleteDialogBtn.vue'
import { addDashboards } from '@/PaneLayoutTemplate'

const props = defineProps<{
  rail: boolean
}>()

const emits = defineEmits<{
  (e: 'update:rail', value: boolean): void
  (e: 'update:session-selectable', value: boolean): void
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
watch(() => graphQlStore?.state.session?.name, () => {
  inputSessionName.value = graphQlStore?.state.session?.name
})

async function updateSessionName() {
  const session = graphQlStore?.state.session
  if (!session) return
  await graphQlStore?.updateSession(inputSessionName.value, session.sessionType, session.defaultDashboardId)
  editSessionName.value = false
}

function onScroll(event: any) {
  console.log(event)
}

const dialog = ref('')
const dialogInNav = ref('')
const saveRail = ref(false)
watch(dialogInNav, () => {
  if (dialogInNav.value) {
    saveRail.value = props.rail
    emits('update:rail', false)
    emits('update:session-selectable', true)
  } else {
    emits('update:rail', saveRail.value)
    emits('update:session-selectable', false)
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

const sessionNameInputElm = ref()
function startEditSessionName() {
  editSessionName.value = true
  setTimeout(() => {
    sessionNameInputElm.value.focus()
  }, 100)
}

async function onSubmitSessionType(sessionType: string): Promise<void> {
  if (!graphQlStore) return
  const sessionName = graphQlStore?.state.session?.name || ''
  const defaultDashboardId = graphQlStore?.state.session?.defaultDashboardId
  await addDashboards(graphQlStore, sessionType)
  await graphQlStore.updateSession(sessionName, sessionType, defaultDashboardId)
}

async function addDashboard() {
  if (!graphQlStore) return
  await graphQlStore.addDashboard(addDashboardName.value, defaultLayout)
  addDashboardName.value = DEFAULT_DASHBOARD_NAME
  addDashboardMenu.value = false
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

const bNavVal = ref([])
watch(bNavVal, v => {
  const a = v.some(s => s === 'show-bar')
  const b = showBar.value
  if ((a && !b) || (!a && b)) showBar.value = !showBar.value

  const c = v.some(s => s === 'dialog-setting')
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
</script>

<!--suppress HtmlUnknownAttribute, SpellCheckingInspection -->
<style scoped lang="scss">
.nav-dialog {
  background-image: url('/paint_00003.jpg');
  background-color: rgba(255, 255, 255, 0.5);
  background-blend-mode: lighten;
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

.v-navigation-drawer :deep(.v-navigation-drawer__content) {
  max-width: initial;
}
.v-navigation-drawer > :deep(*) {
  margin-right: -1px;
}
</style>
