<template>
  {{ graphQlStore?.state.user?.name }}
</template>

<script setup lang="ts">
import 'splitpanes/dist/splitpanes.css'

import { inject } from 'vue'
import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)
</script>
