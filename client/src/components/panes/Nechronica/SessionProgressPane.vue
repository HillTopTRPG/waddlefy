<template>
  <pane-frame title="セッション進行ツール">
    <template #title-action></template>
    <template #layout></template>
    <template #nav></template>
    <template #default> </template>
  </pane-frame>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name: 'SessionProgressPane',
  label: 'セッション進行'
}
</script>

<script setup lang="ts">
import { Layout } from '@/components/panes'
import PaneFrame from '@/components/panes/PaneFrame.vue'

defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

// eslint-disable-next-line unused-imports/no-unused-vars
defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
}>()
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
