<template>
  <v-tooltip transition="scale-transition" :disabled="!rail">
    <template #activator="{ props: tooltipProp }">
      <v-list-item
        variant="flat"
        color="primary"
        v-bind="{ ...$attrs, ...tooltipProp }"
        class="nav-icon-item"
        :class="(toggle ? 'ml-2 pl-2 ' : 'mx-2 pl-2 ') + (props.class || '')"
        :style="toggle ? 'border-radius: 10px 0 0 10px;' : ''"
        @keydown.enter.stop="$event.target.click()"
      >
        <template #prepend>
          <div class="ml-1 mr-3" v-if="icon">
            <v-icon size="small" style="margin-left: 2px">mdi-{{ icon }}</v-icon>
          </div>
          <user-avatar v-if="iconToken" :token="iconToken || ''" class="mr-3" />
        </template>
        <v-list-item-title>{{ title }}</v-list-item-title>
        <v-list-item-subtitle>{{ subtitle }}</v-list-item-subtitle>
      </v-list-item>
    </template>
    <span class="font-weight-bold">{{ title }}</span>
  </v-tooltip>
</template>

<script setup lang="ts">
import UserAvatar from '@/components/parts/UserAvatar.vue'

const props = defineProps<{
  title: string
  class?: string
  subtitle?: string
  icon?: string
  iconToken?: string
  rail: boolean
  toggle: boolean
}>()
</script>

<!--suppress CssUnusedSymbol -->
<style scoped lang="css">
.nav-icon-item {
  margin-right: 1px;
}

.nav-icon-item.v-list-item--active {
  margin-right: -1px;
}
</style>
