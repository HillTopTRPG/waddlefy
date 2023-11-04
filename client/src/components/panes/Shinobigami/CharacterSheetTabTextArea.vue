<template>
  <v-textarea
    :rows="textRows"
    :readonly="true"
    :no-resize="true"
    style="width: 20rem"
    :flat="true"
    variant="solo"
    :model-value="text"
  >
    <template v-slot:label>
      <v-icon :icon="icon" class="mr-1" />
      {{ label }}
    </template>
    <template v-slot:details>
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
            @click="dialog = editable"
            v-bind="props"
          />
        </template>
        <v-card>
          <v-toolbar density="compact" color="primary">
            <v-toolbar-title>{{ characterName }}の{{ label }}</v-toolbar-title>
          </v-toolbar>
          <v-card-item class="pa-2">
            <v-textarea
              :rows="textRows"
              :no-resize="true"
              style="width: 20rem"
              :autofocus="true"
              :hide-details="true"
              :flat="true"
              variant="solo-filled"
              v-model="editText"
            >
              <template v-slot:label>
                <v-icon :icon="icon" class="mr-1" />
                {{ label }}
              </template>
            </v-textarea>
          </v-card-item>
          <v-divider class="mt-0" />
          <v-card-actions class="justify-end px-5">
            <v-btn color="primary" class="w-50" style="box-sizing: border-box" variant="flat" @click="onSave()"
              >保存</v-btn
            >
            <v-btn color="secondary" class="w-50" style="box-sizing: border-box" variant="flat" @click="dialog = false"
              >キャンセル</v-btn
            >
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
  characterName: string
  icon: string
  label: string
  textRows: number
  editable: boolean
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
<style lang="scss" scoped></style>
