<template>
  <v-menu :close-on-content-click="false" v-model="opened">
    <template #activator="{ props }">
      <v-btn text="取り消す" density="compact" variant="outlined" color="error" v-bind="props" />
    </template>
    <v-card class="pa-2">
      <v-card-text class="px-1 py-1">
        このマニューバ履歴を取り消します。<br />
        よろしいですか？
      </v-card-text>
      <v-card-text class="pa-1 d-flex flex-row">
        <v-spacer />
        <v-btn density="comfortable" color="error" variant="outlined" text="履歴を取り消す" @click="onExecute()" />
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

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
