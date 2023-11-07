<template>
  <v-textarea
    :rows="textRows"
    :readonly="true"
    :no-resize="true"
    style="width: 20rem; max-width: 20rem"
    :flat="true"
    :variant="variant || 'solo'"
    :model-value="text || ' '"
    @click="dialog = editable"
  >
    <template v-slot:label>
      <v-icon v-if="icon" :icon="icon" class="mr-1" />
      {{ label }}
    </template>
    <template v-slot:details>
      <div v-if="hint" class="mb-2 align-self-center">{{ hint }}</div>
      <v-spacer />
      <v-dialog width="auto" :persistent="true" v-model="dialog">
        <template v-slot:activator="{ props }">
          <v-btn
            color="primary"
            icon="mdi-pencil"
            class="mb-2"
            variant="elevated"
            density="comfortable"
            size="small"
            :style="{ visibility: editable ? 'visible' : 'hidden' }"
            v-bind="props"
          />
        </template>
        <v-card>
          <v-toolbar density="compact" color="primary">
            <v-toolbar-title>
              <span>{{ label }}</span>
              <span v-if="characterName">({{ characterName }})</span>
              <span>の編集</span>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-item class="pa-2">
            <v-textarea
              :rows="textRows"
              :no-resize="true"
              style="width: 20rem"
              :autofocus="true"
              :persistent-hint="true"
              :hide-details="!Boolean(hint)"
              :flat="true"
              variant="solo-filled"
              :hint="hint"
              v-model="editText"
            >
              <template v-slot:label>
                <v-icon v-if="icon" :icon="icon" class="mr-1" />
                {{ label }}
              </template>
            </v-textarea>
          </v-card-item>
          <v-divider />
          <v-card-actions class="px-2">
            <v-btn color="primary" class="flex-0-1-100" variant="flat" @click="onSave()">保存</v-btn>
            <v-btn color="secondary" class="flex-0-1-100" variant="flat" @click="dialog = false">キャンセル</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </v-textarea>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  text: string
  characterName?: string
  icon: string
  label: string
  textRows: number
  editable: boolean
  hint?: string
  variant?: string
}>()

const emits = defineEmits<{
  (e: 'update', text: string): void
}>()

const dialog = ref(false)
const editText = ref(props.text)

watch(
  () => props.text,
  () => {
    editText.value = props.text
  }
)

watch(dialog, v => {
  if (v) {
    dialog.value = props.editable
  }
})

function onSave() {
  emits('update', editText.value)
  dialog.value = false
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.v-textarea {
  :deep(.v-field) {
    --v-field-padding-start: 0.5rem;
    --v-field-padding-end: 0.5rem;
  }
}
</style>
