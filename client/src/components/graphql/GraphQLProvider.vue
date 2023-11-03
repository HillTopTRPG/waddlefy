<template>
  <slot />
</template>

<script lang="ts" setup>
import { provide } from 'vue'
import useGraphQl, { GraphQlKey } from './graphql'

const props = defineProps<{
  userToken?: string
  playerToken?: string
  sessionId?: string
  dashboardId?: string
}>()

provide(
  GraphQlKey,
  useGraphQl(props.userToken || '', props.playerToken || '', props.sessionId || '', props.dashboardId || '')
)
</script>
