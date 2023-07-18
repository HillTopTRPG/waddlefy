<template>
  <v-list-item
    lines="two"
    class="my-1 py-0 pl-0 pr-1 bg-transparent"
    :class="{ copied }"
    ripple
    variant="outlined"
    :rounded="true"
    @click="writeUrlClipboard()"
  >
    <template v-slot:prepend>
      <v-icon icon="mdi-content-copy" class="mx-3" v-if="!copied" />
      <v-icon icon="mdi-check" color="primary" class="mx-3 check-icon" v-else />
      <user-avatar :token="userAvatarToken" class="mr-3" v-if="userAvatarToken" />
    </template>
    <v-list-item-title>
      <slot>{{ title }}</slot>
    </v-list-item-title>
    <v-list-item-subtitle>{{ subtitleWrap }}</v-list-item-subtitle>
  </v-list-item>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import UserAvatar from '@/components/parts/UserAvatar.vue'

const props = defineProps<{
  title: string
  subtitle: string
  pathName: string
  userAvatarToken?: string
}>()

const copied = ref(false)

// フラグがONでいられるのは2秒間だけ
let copyTimeoutId: number | null = null
watch(copied, value => {
  if (!value) return
  if (copyTimeoutId !== null)  {
    window.clearTimeout(copyTimeoutId)
  }
  copyTimeoutId = window.setTimeout(() => { copied.value = false }, 2000)
})

const subtitleWrap = computed(() => copied.value ? 'クリップボードにコピーしました' : props.subtitle)

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

.v-list-item {
  border-color: rgba(0, 0, 0, 0.2)
}

@keyframes r1 {
  0%   { transform: rotate(270deg) scale(0.4); opacity: 0; }
  100% { transform: rotate(360deg) scale(1.4); opacity: 100; }
}
</style>
