<script setup lang="ts">
import Avatar from 'vue-boring-avatars'

defineProps<{
  token: string
}>()

const emits = defineEmits<{
  (e: 'click'): void
}>()

const colors = ['#f8f8d6', '#f90050', '#5d7e62', '#C7EA46', '#FFC300']
</script>

<template>
  <Avatar variant="beam" class="avatar" :size="32" :name="token" :colors="colors" @click="emits('click')" />
</template>

<style deep lang="css">
.avatar {
  cursor: pointer;
}
.v-badge.player > .v-badge__wrapper > .v-badge__badge {
  visibility: hidden;
}

.v-badge.absolute-color > .v-badge__wrapper > .v-badge__badge {
  background: rgb(var(--v-code-background-color)) !important;
  box-sizing: border-box;
}

.v-badge.absolute-color > .v-badge__wrapper > .v-badge__badge::after {
  color: rgb(var(--v-theme-surface)) !important;
}
</style>
