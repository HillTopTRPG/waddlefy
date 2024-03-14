<template>
  <v-defaults-provider
    :defaults="{
      VTextField: {
        color: 'primary',
        hideDetails: true,
        persistentHint: true,
        persistentPlaceholder: true,
        flat: true,
        variant: 'solo-filled'
      }
    }"
  >
    <v-text-field placeholder="必須" v-model="inputUrl" ref="urlElm">
      <template #label>
        <v-icon icon="mdi-link-variant" class="mr-1" />
        キャラクターシート倉庫のURL
      </template>
    </v-text-field>
    <v-text-field
      :placeholder="passPlaceholder"
      :append-icon="isPasswordType ? 'mdi-eye' : 'mdi-eye-off'"
      :type="isPasswordType ? 'text' : 'password'"
      @click:append="isPasswordType = !isPasswordType"
      v-model="inputViewPass"
    >
      <template #label>
        <v-icon icon="mdi-key-outline" class="mr-1" />
        秘匿情報閲覧パス
      </template>
    </v-text-field>
  </v-defaults-provider>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  url: string
  viewPass: string
  passPlaceholder: string
}>()

const emits = defineEmits<{
  (e: 'update:url', url: string): Promise<void>
  (e: 'update:viewPass', url: string): Promise<void>
}>()

const inputUrl = ref(props.url)
const inputViewPass = ref(props.viewPass)
const isPasswordType = ref(false)
const urlElm = ref()

watch(inputUrl, v => emits('update:url', v))
watch(inputViewPass, v => emits('update:viewPass', v))

defineExpose({
  focus: () => urlElm.value?.focus()
})
</script>

<style lang="scss" scoped></style>
