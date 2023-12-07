<template>
  <v-menu :close-on-content-click="false" v-model="opened">
    <template #activator="{ props }">
      <v-btn density="comfortable" :text="lost ? '損傷から回復する' : '損傷する'" v-bind="props" />
    </template>
    <v-card>
      <v-card-text class="pt-2 pb-0">
        <span v-if="!lost">マニューバを損傷します</span>
        <span v-else>マニューバの損傷から回復します</span>
      </v-card-text>
      <v-card-text class="py-2 d-flex flex-row justify-end">
        <v-btn @click="execute" density="comfortable" text="決定" />
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
