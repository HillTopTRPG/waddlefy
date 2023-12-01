<template>
  <v-menu :close-on-content-click="false" location="top right" v-model="opened">
    <template #activator="{ props }">
      <v-btn
        color="primary"
        variant="text"
        class="text-decoration-underline"
        v-bind="props"
        :disabled="disabled"
        text="全て未使用状態にする"
      />
    </template>
    <v-card>
      <v-card-text>
        全てのマニューバを未使用状態にします。<br />
        よろしいですか？
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-defaults-provider :defaults="{ VBtn: { class: 'flex-grow-1' } }">
          <v-btn color="primary" variant="flat" text="適用する" @click="onResetUsedMenu" />
          <v-btn class="text-decoration-underline" variant="text" text="キャンセル" @click="opened = false" />
        </v-defaults-provider>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  disabled: boolean
}>()

const emits = defineEmits<{
  (e: 'execute'): void
}>()

const opened = ref(false)

function onResetUsedMenu() {
  opened.value = false
  emits('execute')
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
