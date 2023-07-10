<template>
  <v-list-item
    lines="two"
    class="my-1 py-0 pl-1 pr-2"
    :class="{ copied }"
    ripple
    :title="title"
    :subtitle="subtitle"
    @click="writeUrlClipboard()"
  >
    <template v-slot:prepend>
      <v-icon icon="mdi-content-copy" class="mx-3" v-if="!copied" />
      <v-icon icon="mdi-check" color="primary" class="mx-3 check-icon" v-else />
    </template>
  </v-list-item>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps<{
  title: string
  subtitle: string
  pathName: string
}>()

const copied = ref(false)

// フラグがONでいられるのは1秒間だけ
let copyTimeoutId: number | null = null
watch(copied, value => {
  if (!value) return
  if (copyTimeoutId !== null)  {
    window.clearTimeout(copyTimeoutId)
  }
  copyTimeoutId = window.setTimeout(() => copied.value = false, 1000)
})

async function writeUrlClipboard() {
  copied.value = false
  await navigator.clipboard.writeText(`${location.origin}/${props.pathName}`)
  setTimeout(() => {
    copied.value = true
  })
}
</script>

<style lang="scss" scoped>
.copied .check-icon {
  animation: r1 0.3s forwards;
}

@keyframes r1 {
  0%   { transform: rotate(270deg) scale(0.4); opacity: 0; }
  100% { transform: rotate(360deg) scale(1.4); opacity: 100; }
}
</style>
