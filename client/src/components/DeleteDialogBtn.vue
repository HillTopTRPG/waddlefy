<template>
  <v-dialog width="auto" v-model="deleteDialog">
    <template v-slot:activator="{ props }">
      <v-btn color="error" variant="tonal" v-bind="props">この{{ type }}を削除</v-btn>
    </template>
    <v-card>
      <v-card-title class="bg-warning">{{ targetName }} の削除</v-card-title>
      <v-card-text>
        <p>削除するにはこの{{ type }}の名前を入力してください。</p>
      </v-card-text>
      <v-card-item>
        <v-text-field v-model="inputTargetName" :placeholder="targetName"/>
      </v-card-item>
      <v-card-actions>
        <v-btn
          class="flex-grow-1"
          color="warning"
          variant="elevated"
          :disabled="inputTargetName !== targetName"
          text="完全に削除"
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

watch(() => props.sessionId, () => {
  deleteDialog.value = false
  inputTargetName.value = ''
})

const deleteDialog = ref(false)
const inputTargetName = ref('')
async function deleteExecute() {
  await emits('execute')
  deleteDialog.value = false
  inputTargetName.value = ''
}
</script>
