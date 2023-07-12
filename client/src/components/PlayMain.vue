<template>
  <template v-if="graphQlStore?.state.ready">
    <play-main-navigation-drawer
      v-if="graphQlStore?.state.user?.token"
      v-model:rail="firstRail"
      v-model:nav="selectedFirstNav"
    />

    <v-main :scrollable="true">
      <dashboard-view v-model:rail="secondRail" v-model:nav="selectedSecondNav" />
    </v-main>
  </template>
</template>

<script lang="ts" setup>
import { reactive, inject, ref, computed, watch } from 'vue'
import PlayMainNavigationDrawer from '@/components/PlayMainNavigationDrawer.vue'
import DashboardView from '@/components/view/DashboardView.vue'

import { Layout } from '@/components/panes'
import defaultLayout from '@/PaneLayoutTemplate/DefaultLayout'
const layout = reactive<Layout>({ ...JSON.parse(JSON.stringify(defaultLayout)) })
console.log(JSON.stringify(layout, null, 2))

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

// noinspection TypeScriptValidateTypes
const props = defineProps<{
  rail?: string
  firstNav?: string
  secondNav?: string
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
const selectedFirstNav = ref<string>(props.firstNav || '')
const selectedSecondNav = ref<string>(props.secondNav || '')

function createPathName() {
  const firstNav = selectedFirstNav.value ? `/${selectedFirstNav.value}` : ''
  const secondNav = firstNav ? selectedSecondNav.value ? `/${selectedSecondNav.value}` : '' : ''
  const firstRailString = firstRail.value ? '1' : '0'
  let secondRailString = ''
  if (['setting', 'profile'].every(s => s !== selectedFirstNav.value)) {
    secondRailString = `,${secondRail.value ? '1' : '0'}`
  }
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

const navMap = new Map()
const railMap = new Map()

watch([firstRail, secondRail, selectedFirstNav, selectedSecondNav], async () => {
  switch(selectedFirstNav.value) {
    case 'setting':
    case 'profile':
      break
    default:
      const dashboardId = selectedFirstNav.value
      if (dashboardId !== graphQlStore?.state.dashboard?.id) {
        navMap.set(graphQlStore?.state.dashboard?.id || '', selectedSecondNav.value)
        railMap.set(graphQlStore?.state.dashboard?.id || '', secondRail.value)
        await graphQlStore?.directDashboardAccess(dashboardId)
        selectedSecondNav.value = navMap.get(graphQlStore?.state.dashboard?.id || '') || ''
        secondRail.value = railMap.get(graphQlStore?.state.dashboard?.id || '') || false
      }
  }
  const pathName = createPathName()
  history.replaceState(null, '', pathName)
})
</script>
