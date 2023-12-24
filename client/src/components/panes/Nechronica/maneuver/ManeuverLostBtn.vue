<template>
  <v-menu :close-on-content-click="false" v-model="opened">
    <template #activator="{ props }">
      <v-btn
        density="comfortable"
        :text="$t(lost ? 'Nechronica.label.recover-lost' : 'Nechronica.label.to-lost')"
        v-bind="props"
      />
    </template>
    <v-card>
      <v-card-text class="pt-2 pb-0">
        <span v-if="!lost">{{ $t('Nechronica.label.to-lost-confirm-message') }}</span>
        <span v-else>{{ $t('Nechronica.label.recover-lost-confirm-message') }}</span>
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
  lost: boolean
}>()

const opened = ref(false)

const emits = defineEmits<{
  (e: 'execute', lost: boolean): void
}>()

function execute() {
  opened.value = false
  emits('execute', !props.lost)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
