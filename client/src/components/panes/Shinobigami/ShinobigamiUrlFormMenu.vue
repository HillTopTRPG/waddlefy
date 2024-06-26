<template>
  <v-menu v-model="opened" location="bottom left" :close-on-content-click="false" scroll-strategy="close">
    <template #activator="{ props }">
      <v-defaults-provider :defaults="{ VBtn: { variant: 'text', density: 'comfortable' } }">
        <v-btn class="text-decoration-underline" v-bind="props" :color="textColor">{{ text }}</v-btn>
      </v-defaults-provider>
    </template>
    <v-card>
      <v-card-text class="d-flex flex-column text-pre-wrap pa-2" style="gap: 0.5rem">
        <v-alert color="light-blue-lighten-4" class="pb-0 pt-2">
          <v-alert-title class="d-flex flex-row justify-space-between pb-2">
            <div class="px-3 rounded-xl bg-secondary text-caption font-italic">Tips</div>
            <v-defaults-provider :defaults="{ VProgressCircular: { size: 'x-small', bgColor: 'transparent' } }">
              <v-progress-circular :model-value="carouselTimerNum" color="blue-grey-lighten-2" />
            </v-defaults-provider>
          </v-alert-title>
          <v-defaults-provider :defaults="{ VCarousel: { showArrows: false, progress: false, interval: 11000 } }">
            <v-defaults-provider :defaults="{ VCarousel: { cycle: true, touch: true, height: 85 } }">
              <v-carousel :hide-delimiter-background="true" style="width: 21em" v-model="carouselValue">
                <v-carousel-item v-for="(tip, idx) in tipsWrap" :key="idx">
                  <div v-html="tip"></div>
                </v-carousel-item>
              </v-carousel>
            </v-defaults-provider>
          </v-defaults-provider>
        </v-alert>
        <shinobigami-url-form
          v-model:url="addUrl"
          v-model:view-pass="password"
          :pass-placeholder="passPlaceholder"
          ref="form"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-defaults-provider :defaults="{ VBtn: { color: 'primary', class: 'flex-0-1-100' } }">
          <v-btn variant="text" class="text-decoration-underline" @click="opened = false" :text="$t('label.cancel')" />
          <v-btn variant="flat" @click="onExecute()" :disabled="!addUrl" text="読込" />
        </v-defaults-provider>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import ShinobigamiUrlForm from '@/components/panes/Shinobigami/ShinobigamiUrlForm.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useTheme } from 'vuetify'
const theme = useTheme()
const textColor = computed(() => (theme.global.name.value === 'dark' ? 'secondary' : 'primary'))

const props = defineProps<{
  text: string
  tips: string[]
  passPlaceholder: string
}>()

const emits = defineEmits<{
  (e: 'execute', url: string, password: string): void
}>()

const tipsWrap = computed(() =>
  props.tips.map(t => t.replace(/\n/g, '<br />').replace(/\$b\$(.+?)\$b\$/g, '<b>$1</b>'))
)

const addUrl = ref('')
const password = ref('')
async function onExecute() {
  emits('execute', addUrl.value, password.value)
  addUrl.value = ''
  password.value = ''
  opened.value = false
}

const opened = ref(false)

const carouselTimerNum = ref(100)
const carouselTimer = ref<number | null>(null)

const carouselValue = ref(0)
const form = ref()
watch(carouselValue, () => {
  carouselTimerNum.value = 100
})
watch(opened, v => {
  if (v) {
    carouselTimerNum.value = 100
    carouselValue.value = 0
    addUrl.value = ''
    password.value = ''
    setTimeout(() => form.value?.focus(), 300)
  }
})
onMounted(() => {
  carouselTimer.value = window.setInterval(() => {
    if (carouselTimerNum.value > 0) {
      carouselTimerNum.value -= 1
    } else {
      if (carouselValue.value + 1 <= 3) {
        carouselValue.value += 1
      } else {
        carouselValue.value = 0
      }
      carouselTimerNum.value = 100
    }
  }, 100)
})
</script>

<style lang="scss" scoped></style>
