<template>
  <v-menu :close-on-content-click="false" v-model="opened">
    <template #activator="{ props }">
      <v-btn density="comfortable" variant="flat" v-bind="props">
        <v-icon icon="mdi-plus" />
        <span class="text-decoration-underline">{{ $t('Nechronica.label.add-unknown-maneuver') }}</span>
      </v-btn>
    </template>
    <v-card>
      <v-card-text class="pt-2 pb-0 d-flex flex-column">
        <span>{{ $t('Nechronica.label.add-unknown-maneuver-message') }}</span>
      </v-card-text>
      <v-card-text class="py-2 d-flex flex-row justify-end">
        <v-btn @click="execute" density="comfortable" :text="$t('label.decision')" />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const opened = ref(false)

const emits = defineEmits<{
  (e: 'execute'): void
}>()

function execute() {
  opened.value = false
  emits('execute')
}
</script>

<style lang="scss" scoped></style>
