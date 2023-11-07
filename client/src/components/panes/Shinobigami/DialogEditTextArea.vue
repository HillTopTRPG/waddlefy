<template>
  <v-dialog width="auto" :persistent="true" v-model="dialog">
    <template v-slot:activator="{ props }">
      <v-textarea
        :rows="textRows"
        :readonly="true"
        :no-resize="true"
        style="width: 20rem; max-width: 20rem"
        :flat="true"
        :hide-details="true"
        :variant="variant || 'solo'"
        :model-value="text || ' '"
        v-bind="props"
      >
        <template v-slot:label>
          <v-icon v-if="icon" :icon="icon" class="mr-1" />
          {{ label }}
        </template>
      </v-textarea>
    </template>
    <v-card>
      <v-toolbar density="compact" color="primary">
        <v-toolbar-title>
          <span>{{ title }}</span>
        </v-toolbar-title>
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
          v-model="editingText"
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

<script setup lang="ts">
import { ref, watch } from 'vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  title: string
  label: string
  icon: string
  text: string
  textRows: number
  variant: string
  editable: boolean
}>()

const emits = defineEmits<{
  (e: 'update', value: string): Promise<void>
}>()

const dialog = ref(false)
const editingText = ref(props.text)

watch(dialog, () => {
  if (!props.editable) {
    dialog.value = false
  }
})

function onSave() {
  emits('update', editingText.value)
  dialog.value = false
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
