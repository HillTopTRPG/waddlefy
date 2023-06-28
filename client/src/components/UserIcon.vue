<script setup lang='ts'>
import UserAvatar from '@/components/UserAvatar.vue'
import {User} from "@/components/graphql/schema";

defineProps<{
  user?: User
}>()
</script>

<template>
  <v-badge
    class='login-status'
    :bordered='true'
    :color='user?.connections.length ? "green-darken-1" : "grey-darken-1"'
    location='right bottom'
  >
    <template #badge>
      <span class='text-black' v-if='!user?.connections.length'>●</span>
      <template v-else-if='user?.connections.length > 1'>{{ user?.connections.length }}</template>
    </template>
    <user-avatar :user='user' />
  </v-badge>
</template>

<!--suppress CssUnusedSymbol, HtmlUnknownAttribute, CssUnresolvedCustomProperty -->
<style deep lang='css'>
.v-badge__badge {
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.v-badge__badge::after {
  transform: none !important;
}

.v-badge.login-status > .v-badge__wrapper > .v-badge__badge > * {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
