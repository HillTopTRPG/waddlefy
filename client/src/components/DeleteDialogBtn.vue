<template>
  <v-dialog width="auto" v-model="deleteDialog">
    <template v-slot:activator="{ props }">
      <v-btn color="error" variant="text" class="text-decoration-underline" v-bind="props">この{{ type }}を削除</v-btn>
    </template>
    <v-card>
      <v-card-title class="bg-warning">{{ type }}の削除</v-card-title>
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
        />
      </v-card-item>
      <v-divider />
      <v-card-actions class="px-5">
        <v-spacer />
        <v-btn
          color="warning"
          variant="elevated"
          :disabled="inputTargetName !== targetName"
          text="完全に削除"
          class="px-5"
          @click="deleteExecute()"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import 'splitpanes/dist/splitpanes.css'

const props = defineProps<{
  type: string
  targetName: string
  sessionId: string
}>()

const emits = defineEmits<{
  (e: 'execute'): Promise<void>
}>()

watch(
  () => props.sessionId,
  () => {
    deleteDialog.value = false
    inputTargetName.value = ''
  }
)

const deleteDialog = ref(false)
const inputTargetName = ref('')
async function deleteExecute() {
  await emits('execute')
  deleteDialog.value = false
  inputTargetName.value = ''
}

watch(deleteDialog, () => {
  inputTargetName.value = ''
})
</script>
