<template>
  <v-menu :close-on-content-click="false" v-model="opened">
    <template #activator="{ props }">
      <v-btn
        density="comfortable"
        :text="$t(isUnknown ? 'Nechronica.label.to-un-unknown' : 'Nechronica.label.to-unknown')"
        v-bind="props"
      />
    </template>
    <v-card>
      <v-card-text class="pt-2 pb-0">
        <span v-if="isUnknown">{{ $t('Nechronica.label.to-un-unknown-confirm-message') }}</span>
        <span v-else>{{ $t('Nechronica.label.to-unknown-confirm-message') }}</span>
      </v-card-text>
      <v-card-text class="py-2 d-flex flex-row justify-end">
        <v-btn @click="execute" density="comfortable" :text="$t('label.decision')" />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isUnknown: boolean
}>()

const opened = ref(false)

const emits = defineEmits<{
  (e: 'execute', isUnknown: boolean): void
}>()

function execute() {
  opened.value = false
  emits('execute', !props.isUnknown)
}
</script>

<style lang="scss" scoped></style>
