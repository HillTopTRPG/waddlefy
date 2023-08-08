<template>
  <template v-if="graphQlStore?.state.ready">
    <play-main-navigation-drawer v-model:rail="firstRail" v-if="graphQlStore?.state.user?.token && sessionSelectable" />

    <v-main :scrollable="true">
      <session-view v-model:rail="secondRail" @update:session-selectable="v => { sessionSelectable = v }" />
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
  const secondNav = firstNav ? dashboardId.value ? `/${dashboardId.value}` : '' : ''
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

watch([firstRail, secondRail, sessionId, dashboardId], async () => {
  const pathName = createPathName()
  history.replaceState(null, '', pathName)
}, { immediate: true })
</script>
