<template>
  <graph-ql-provider
    :connectionId="connectionId"
    :roomToken="roomToken"
    :userToken="userToken"
  >
    <login-main />
    <play-main rail="1" />
  </graph-ql-provider>
</template>

<script lang="ts" setup>
import GraphQlProvider from '@/components/graphql/provider/index.vue'
import LoginMain from '@/components/graphql/provider/LoginMain.vue'
import PlayMain from "@/components/graphql/provider/PlayMain.vue";

defineProps<{
  connectionId?: string,
  roomToken?: string,
  userToken?: string,
}>()
</script>
