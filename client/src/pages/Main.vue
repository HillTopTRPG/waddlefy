<template>
  <graph-ql-provider
    :userToken="userToken"
    :playerToken="playerToken"
    :sessionId="sessionId"
    :dashboardId="dashboardId"
  >
    <play-main :rail="rail" />
  </graph-ql-provider>
</template>

<script lang="ts" setup>
import GraphQlProvider from '@/components/graphql/GraphQLProvider.vue'
import PlayMain from '@/components/PlayMain.vue'

defineProps<{
  userToken?: string,
  playerToken?: string,
  sessionId?: string,
  dashboardId?: string,
  rail?: string,
}>()
</script>
