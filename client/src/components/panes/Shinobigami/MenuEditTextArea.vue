<template>
  <v-menu
    width="auto"
    v-model="dialog"
    :close-on-content-click="false"
    transition="scroll-y-transition"
    scroll-strategy="close"
    location="bottom center"
    :offset="offset || 0"
  >
    <template v-slot:activator="{ props }">
      <v-textarea
        :class="textareaClass"
        :rows="textRows"
        :readonly="true"
        :no-resize="true"
        :placeholder="placeholder || ''"
        :persistent-placeholder="true"
        :hide-details="!Boolean(hint)"
        :persistent-hint="true"
        :hint="hint || ''"
        style="width: 20rem; max-width: 20rem; cursor: pointer"
        :flat="true"
        :variant="variant || 'solo'"
        :model-value="text || ''"
        v-bind="props"
      >
        <template v-slot:label>
          <v-icon v-if="icon" :icon="icon" class="mr-1" />
          {{ label }}
        </template>
      </v-textarea>
    </template>
    <v-card rounded="lg">
      <v-card-item class="pa-2">
        <v-textarea
          :rows="textRows"
          :no-resize="true"
          :placeholder="placeholder || ''"
          :persistent-placeholder="true"
          :hint="hint || ''"
          :persistent-hint="true"
          :hide-details="!Boolean(hint)"
          style="width: 20rem"
          :autofocus="true"
          :flat="true"
          variant="solo-filled"
          v-model="editingText"
          ref="editElm"
        >
          <template v-slot:label>
            <v-icon v-if="icon" :icon="icon" class="mr-1" />
            {{ label }}
          </template>
        </v-textarea>
      </v-card-item>
      <v-divider />
      <v-card-actions class="px-2">
        <v-btn class="flex-0-1-100 text-decoration-underline" variant="text" @click="dialog = false">キャンセル</v-btn>
        <v-btn color="primary" class="flex-0-1-100" variant="flat" @click="onSave()">保存</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  label: string
  icon: string
  text: string
  placeholder?: string
  hint?: string
  textRows: number
  offset?: number
  variant: string
  editable: boolean
  textareaClass?: string
}>()

const emits = defineEmits<{
  (e: 'update', value: string): Promise<void>
}>()

const dialog = ref(false)
const editElm = ref()
const editingText = ref(props.text)

watch(dialog, v => {
  if (!props.editable) {
    dialog.value = false
  }
  if (v) {
    setTimeout(() => editElm.value?.focus(), 300)
  } else {
    editingText.value = props.text
  }
})

function onSave() {
  emits('update', editingText.value)
  dialog.value = false
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.v-textarea {
  cursor: pointer;
}
</style>
