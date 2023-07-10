<template>
  <slot />
</template>

<script lang="ts" setup>
import { provide } from 'vue'
import useGraphQl, { GraphQlKey } from './graphql'

const props = defineProps<{
  userToken?: string
  playerToken?: string
  firstNav?: string
}>()

provide(GraphQlKey, useGraphQl(
  props.userToken || '',
  props.playerToken || '',
  ['setting', 'profile'].every(s => s !== props.firstNav) ? props.firstNav || '' : ''
))
</script>
