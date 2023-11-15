<template>
  <v-menu width="auto" v-model="opened" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn color="error" variant="text" class="text-decoration-underline" :class="classText || ''" v-bind="props"
        >この{{ type }}を削除</v-btn
      >
    </template>
    <v-card>
      <v-card-text class="pb-1">削除するにはこの{{ type }}の名前を入力してください</v-card-text>
      <v-card-item class="pa-2">
        <v-text-field
          :label="`${type}の名前`"
          v-model="inputTargetName"
          :autofocus="true"
          variant="solo-filled"
          color="blue-gray-lighten-4"
          :flat="true"
          :hide-details="true"
          :persistent-placeholder="true"
          :placeholder="targetName"
          ref="inputElm"
        />
      </v-card-item>
      <v-divider />
      <v-card-actions class="px-2">
        <v-btn class="flex-0-1-100 text-decoration-underline" variant="text" @click="opened = false">キャンセル</v-btn>
        <v-btn
          color="warning"
          class="flex-0-1-100"
          variant="flat"
          :disabled="inputTargetName !== targetName"
          @click="deleteExecute()"
          >完全に削除</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import 'splitpanes/dist/splitpanes.css'
import { ref, watch } from 'vue'

const props = defineProps<{
  type: string
  targetName: string
  sessionId: string
  classText?: string
}>()

const emits = defineEmits<{
  (e: 'execute'): Promise<void>
}>()

watch(
  () => props.sessionId,
  () => {
    opened.value = false
    inputTargetName.value = ''
  }
)

const opened = ref(false)
const inputTargetName = ref('')
const inputElm = ref()

async function deleteExecute() {
  await emits('execute')
  opened.value = false
  inputTargetName.value = ''
}

watch(opened, v => {
  if (v) {
    inputTargetName.value = ''
    setTimeout(() => inputElm.value?.focus(), 300)
  }
})
</script>
