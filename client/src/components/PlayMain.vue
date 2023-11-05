<template>
  <template v-if="graphQlStore?.state.ready">
    <play-main-navigation-drawer
      v-model:rail="firstRail"
      :sessionSelectable="sessionSelectable"
      v-if="graphQlStore?.state.user?.token"
    />

    <v-main :scrollable="true">
      <session-view v-model:first-rail="sessionSelectable" v-model:rail="secondRail" />

      <!-- 通知Snackbar START -->
      <v-sheet
        v-if="graphQlStore"
        class="position-fixed d-flex flex-column bg-transparent"
        style="right: 0; top: 34px; z-index: 10000000000"
        :height="Math.max(graphQlStore.state.notifications.length * 60 - 10, 0)"
        width="344"
      >
        <template v-for="(notification, idx) in graphQlStore.state.notifications" :key="notification.id">
          <v-snackbar
            class="notify-snackbar"
            variant="flat"
            transition="slide-x-transition"
            :timeout="3000"
            :color="notification.type === 'success' ? 'green' : notification.type === 'warn' ? 'yellow' : 'red'"
            content-class="border rounded-s-xl"
            :contained="true"
            :width="250"
            :model-value="notification.view"
            :style="`margin-bottom: ${idx * 60}px;`"
            @update:model-value="graphQlStore.closeNotification(notification.id)"
            @click="graphQlStore.closeNotification(notification.id)"
          >
            <v-icon
              :icon="`mdi-${
                notification.type === 'success' ? 'check' : notification.type === 'warn' ? 'warn' : 'error'
              }`"
            />
            {{ notification.text }}
          </v-snackbar>
        </template>
      </v-sheet>
      <!-- 通知Snackbar END -->
    </v-main>
  </template>
</template>

<script lang="ts" setup>
import { inject, ref, computed, watch } from 'vue'
import PlayMainNavigationDrawer from '@/components/PlayMainNavigationDrawer.vue'
import SessionView from '@/components/view/SessionView.vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// noinspection TypeScriptValidateTypes
const props = defineProps<{
  rail?: string
}>()

const railSplit = computed(() => {
  const split = (props.rail || '').split(',')
  if (split.length === 0) {
    return [false, false]
  }
  if (split.length === 1) {
    return [split[0] === '1', false]
  }
  return [split[0] === '1', split[1] === '1']
})

const firstRail = ref(railSplit.value[0])
const secondRail = ref(railSplit.value[1])
const sessionId = computed(() => graphQlStore?.state.session?.id)
const dashboardId = computed(() => graphQlStore?.state.dashboard?.id)

const sessionSelectable = ref(false)

function createPathName() {
  const firstNav = sessionId.value ? `/${sessionId.value}` : ''
  const secondNav = firstNav ? (dashboardId.value ? `/${dashboardId.value}` : '') : ''
  const firstRailString = firstRail.value ? '1' : '0'
  const secondRailString = `,${secondRail.value ? '1' : '0'}`
  if (graphQlStore) {
    const player = graphQlStore.state.player
    if (player) {
      return `/p/${player.token}${firstNav}${secondNav}?rail=${firstRailString}${secondRailString}`
    }
    const user = graphQlStore.state.user
    if (user) {
      return `/u/${user.token}${firstNav}${secondNav}?rail=${firstRailString}${secondRailString}`
    }
  }
  return ''
}

watch(
  [firstRail, secondRail, sessionId, dashboardId],
  async () => {
    const pathName = createPathName()
    history.replaceState(null, '', pathName)
  },
  { immediate: true }
)
</script>
