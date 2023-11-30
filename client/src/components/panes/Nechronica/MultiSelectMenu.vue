<template>
  <v-menu :close-on-content-click="false" v-model="open">
    <template #activator="{ props }">
      <v-btn
        :text="title"
        color="secondary"
        density="comfortable"
        class="text-decoration-underline"
        variant="flat"
        v-bind="props"
      />
    </template>
    <v-card>
      <v-card-title v-text="title" class="pb-0" />
      <v-card-subtitle v-text="'上から順番にチェックが入っている処理を行います。'" class="pb-0" />
      <v-card-text class="py-1">
        <template v-for="item in items" :key="item.value">
          <v-switch
            :label="item.text"
            density="compact"
            true-icon="mdi-check"
            :color="item.color"
            :hide-details="true"
            :value="item.value"
            v-model="results"
          />
        </template>
      </v-card-text>
      <v-card-text class="pt-1 d-flex flex-row justify-end">
        <v-btn text="実行" color="primary" @click="execute" />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  title: string
  items: { text: string; value: string; color: string }[]
}>()

const results = ref<string[]>(props.items.map(item => item.value))
watch(
  () => props.items,
  () => {
    results.value = props.items.map(item => item.value)
  }
)

const open = ref(false)

const emits = defineEmits<{
  (e: 'execute', option: string[]): Promise<void>
}>()

function execute() {
  open.value = false
  emits('execute', results.value)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
