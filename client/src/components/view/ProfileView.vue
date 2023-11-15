<template>
  {{ graphQlStore?.state.user?.name }}
</template>

<script setup lang="ts">
import 'splitpanes/dist/splitpanes.css'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import { inject } from 'vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)
</script>
