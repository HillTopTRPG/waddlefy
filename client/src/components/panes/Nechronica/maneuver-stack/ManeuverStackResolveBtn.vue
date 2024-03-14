<template>
  <v-menu :close-on-content-click="false" v-model="opened" location="bottom right">
    <template #activator="{ props }">
      <v-btn
        :text="$t('Nechronica.label.to-resolve')"
        density="comfortable"
        variant="elevated"
        color="primary"
        v-bind="props"
      />
    </template>
    <v-card class="pa-2">
      <v-card-text class="px-1 py-1">{{ $t('Nechronica.label.to-resolve-confirm-message') }}</v-card-text>
      <v-card-text class="pa-1 d-flex flex-row">
        <v-spacer />
        <v-btn density="comfortable" color="info" variant="outlined" :text="$t('label.execute')" @click="onExecute()" />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emits = defineEmits<{
  (e: 'execute'): void
}>()

const opened = ref(false)

function onExecute() {
  opened.value = false
  emits('execute')
}
</script>

<style lang="scss" scoped></style>
