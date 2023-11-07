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
        class="position-fixed d-flex flex-column align-end bg-transparent"
        style="right: 0; top: 74px; z-index: 1000"
      >
        <v-defaults-provider
          :defaults="{
            VSnackbar: {
              location: 'top right',
              variant: 'flat',
              transition: 'slide-x-reverse-transition',
              timeout: -1,
              contained: true,
              class: 'notify-snackbar mx-0 mt-0 mb-1 position-relative',
              style: 'cursor: pointer'
            }
          }"
        >
          <v-snackbar
            color="orange-lighten-3"
            class="pa-0"
            content-class="border rounded-xl position-static text-center pa-0"
            @update:model-value="graphQlStore.closeNotificationAll()"
            @click="graphQlStore.closeNotificationAll()"
            min-width="1px"
            min-height="30px"
            :model-value="graphQlStore.state.notifications.filter(n => n.view).length > 1"
          >
            <template v-slot:default>通知を全て閉じる</template>
          </v-snackbar>
          <template v-for="notification in graphQlStore.state.notifications" :key="notification.id">
            <v-snackbar
              :color="notification.color"
              content-class="border rounded-0 rounded-s-xl position-static"
              :width="250"
              :model-value="notification.view"
              @update:model-value="graphQlStore.closeNotification(notification.id)"
              @click="graphQlStore.closeNotification(notification.id)"
            >
              <div class="d-flex flex-row">
                <v-icon :icon="notification.icon" class="mr-2" />
                <span>{{ notification.text }}</span>
              </div>
            </v-snackbar>
          </template>
        </v-defaults-provider>
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
