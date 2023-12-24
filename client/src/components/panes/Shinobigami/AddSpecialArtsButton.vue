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
      <v-btn variant="text" :class="classText" v-bind="props">
        <v-icon v-if="buttonIcon" :icon="buttonIcon" class="mr-1" />
        <span class="text-decoration-underline">{{ buttonText }}</span>
      </v-btn>
    </template>
    <v-card :rounded="false" border>
      <v-card-item class="pa-2">
        <v-text-field
          variant="solo-filled"
          label="奥義名"
          :persistent-placeholder="true"
          :hide-details="true"
          v-model="name"
          ref="nameElm"
        />
      </v-card-item>
      <v-divider />
      <v-card-actions class="px-2">
        <v-btn
          class="flex-0-1-100 text-decoration-underline"
          variant="text"
          @click="opened = false"
          :text="$t('label.cancel')"
        />
        <v-btn color="primary" class="flex-0-1-100" variant="flat" :disabled="!name" @click="onSubmit()">{{
          confirmText
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

defineProps<{
  buttonText: string
  buttonIcon: string
  confirmText: string
  classText: string
}>()

const emits = defineEmits<{
  (e: 'submit', name: string): Promise<void>
}>()

const opened = ref(false)
const name = ref('')
const nameElm = ref()

watch(opened, v => {
  if (v) {
    name.value = ''
    setTimeout(() => nameElm.value?.focus(), 300)
  }
})

async function onSubmit() {
  await emits('submit', name.value)
  opened.value = false
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
