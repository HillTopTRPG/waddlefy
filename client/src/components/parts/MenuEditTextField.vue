<template>
  <v-menu
    width="auto"
    v-model="opened"
    location="bottom center"
    transition="scroll-y-transition"
    scroll-strategy="close"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <v-text-field
        :variant="variant || ('solo' as 'solo')"
        :placeholder="placeholder || ''"
        :readonly="true"
        :flat="true"
        :style="`width: ${width}rem; max-width: ${width}rem`"
        :persistent-placeholder="true"
        :hide-details="true"
        :class="`${classText || ''} ${editable ? 'editable' : ''}`"
        :model-value="text"
        v-bind="props"
      >
        <template #label>
          <v-icon v-if="icon" :icon="icon" class="mr-1" />
          {{ label }}
        </template>
      </v-text-field>
    </template>
    <v-card :rounded="false" border>
      <v-card-item class="pa-2">
        <v-text-field
          :label="label"
          :type="type || 'text'"
          :min="min || 1"
          :step="step || 1"
          variant="solo-filled"
          :placeholder="placeholder || ''"
          :flat="true"
          :style="`width: ${Math.max(width, 10.5)}rem; max-width: ${Math.max(width, 10.5)}rem`"
          :persistent-placeholder="true"
          :hide-details="true"
          :autofocus="true"
          :model-value="editingText"
          @update:model-value="v => (editingText = v.toString())"
          ref="editElm"
        >
          <template #label>
            <v-icon v-if="icon" :icon="icon" class="mr-1" />
            {{ label }}
          </template>
        </v-text-field>
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

const props = defineProps<{
  label: string
  text: string
  icon?: string
  placeholder?: string
  variant?: 'outlined' | 'plain' | 'solo-filled' | 'filled' | 'underlined' | 'solo' | 'solo-inverted'
  width: number
  editable: boolean
  classText?: string
  type?: string
  min?: number
  step?: number
}>()

const emits = defineEmits<{
  (e: 'update', value: string): Promise<void>
}>()

const opened = ref(false)
const editElm = ref()
const editingText = ref(props.text)

watch(
  () => props.text,
  v => {
    editingText.value = v
  }
)

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
  opened.value = false
  emits('update', editingText.value)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.v-text-field.editable:deep(input[readonly]) {
  cursor: pointer;
}
:deep(.v-field__input) {
  min-height: auto !important;
}
</style>
