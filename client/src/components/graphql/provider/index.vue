<template>
  <slot />
</template>

<script lang="ts" setup>
import { provide } from 'vue'
import useGraphQl, { GraphQlKey } from '../graphql'

const props = defineProps<{
  connectionId?: string,
  roomToken?: string,
  userToken?: string,
}>()

provide(GraphQlKey, useGraphQl(
  props.connectionId || '',
  props.roomToken || '',
  props.userToken || ''
))
</script>
