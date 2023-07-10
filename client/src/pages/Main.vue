<template>
  <graph-ql-provider
    :userToken="userToken"
    :playerToken="playerToken"
    :firstNav="firstNav"
  >
    <play-main :firstNav="firstNav" :secondNav="secondNav" :rail="rail" />
  </graph-ql-provider>
</template>

<script lang="ts" setup>
import GraphQlProvider from '@/components/graphql/GraphQLProvider.vue'
import PlayMain from "@/components/PlayMain.vue";

defineProps<{
  userToken?: string,
  playerToken?: string,
  firstNav?: string,
  secondNav?: string,
  rail?: string,
}>()
</script>
