<template>
  <v-defaults-provider :defaults="{ VTextField: { color: 'primary', persistentPlaceholder: true, flat: true } }">
    <v-text-field
      :placeholder="$t('label.required')"
      :hide-details="true"
      variant="solo-filled"
      v-model="inputUrl"
      ref="urlElm"
    >
      <template #label>
        <v-icon icon="mdi-link-variant" class="mr-1" />
        {{ $t('Nechronica.label.character-vault-url') }}
      </template>
    </v-text-field>
  </v-defaults-provider>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  url: string
}>()

const emits = defineEmits<{
  (e: 'update:url', url: string): Promise<void>
}>()

const inputUrl = ref(props.url)
const urlElm = ref()

watch(inputUrl, v => emits('update:url', v))

defineExpose({
  focus: () => urlElm.value?.focus()
})
</script>

<style lang="scss" scoped></style>
