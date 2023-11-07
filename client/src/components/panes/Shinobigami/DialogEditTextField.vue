<template>
  <v-dialog width="auto" :persistent="true" v-model="dialog">
    <template v-slot:activator="{ props }">
      <v-text-field
        :label="label"
        variant="solo"
        :readonly="true"
        :flat="true"
        :style="`width: ${width}rem; max-width: ${width}rem`"
        :persistent-placeholder="true"
        :hide-details="true"
        :model-value="text"
        v-bind="props"
      />
    </template>
    <v-card>
      <v-toolbar density="compact" color="primary">
        <v-toolbar-title>
          <span>{{ title }}</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-item class="pa-2">
        <v-text-field
          :label="label"
          variant="solo"
          :flat="true"
          :style="`width: ${width}rem; max-width: ${width}rem`"
          :persistent-placeholder="true"
          :hide-details="true"
          v-model="editingText"
        />
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
  text: string
  width: number
  editable: boolean
}>()

const emits = defineEmits<{
  (e: 'update', value: string): Promise<void>
}>()

const dialog = ref(false)
const editingText = ref(props.text)

watch(
  () => props.text,
  v => {
    editingText.value = v
  }
)

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
