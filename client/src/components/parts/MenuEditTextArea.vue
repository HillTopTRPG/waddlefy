<template>
  <v-menu
    width="auto"
    v-model="opened"
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
        :style="`width: ${width || 20}rem; max-width: ${width || 20}rem;`"
        style="cursor: pointer"
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
          :style="`width: ${width || 20}rem; max-width: ${width || 20}rem;`"
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
        <v-btn class="flex-0-1-100 text-decoration-underline" variant="text" @click="opened = false">キャンセル</v-btn>
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
  width?: number
  variant: string
  editable: boolean
  textareaClass?: string
}>()

const emits = defineEmits<{
  (e: 'update', value: string): Promise<void>
}>()

const opened = ref(false)
const editElm = ref()
const editingText = ref(props.text)

watch(opened, v => {
  if (!props.editable) {
    opened.value = false
  }
  if (v) {
    editingText.value = props.text
    setTimeout(() => editElm.value?.focus(), 300)
  }
})

function onSave() {
  emits('update', editingText.value)
  opened.value = false
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.v-textarea {
  cursor: pointer;
}
</style>
