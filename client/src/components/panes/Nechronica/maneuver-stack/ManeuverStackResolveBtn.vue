<template>
  <v-menu :close-on-content-click="false" v-model="opened" location="bottom right">
    <template #activator="{ props }">
      <v-btn text="まとめて消す" density="comfortable" variant="outlined" color="primary" v-bind="props" />
    </template>
    <v-card class="pa-2">
      <v-card-text class="px-1 py-1">
        ここに表示されているマニューバ履歴を消します。<br />
        よろしいですか？<br />
        ※ 操作は取り消されません。
      </v-card-text>
      <v-card-text class="pa-1 d-flex flex-row">
        <v-spacer />
        <v-btn density="comfortable" color="error" variant="outlined" text="履歴を消す" @click="onExecute()" />
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
