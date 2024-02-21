<template>
  <v-btn
    class="text-caption px-1"
    :color="ignoreBravado ? 'grey' : 'info'"
    style="min-width: auto"
    :hide-details="true"
    density="comfortable"
    @click="emits('click')"
  >
    <v-icon :icon="ignoreBravado ? 'mdi-skull' : 'mdi-emoticon-tongue'" />
    <span data-cy="text" :class="ignoreBravado ? 'text-decoration-line-through' : ''">平気</span>
  </v-btn>
</template>

<script setup lang="ts">
defineProps<{
  ignoreBravado: boolean | undefined
}>()

const emits = defineEmits<{
  (e: 'click'): Promise<void>
}>()
</script>

<style lang="scss" scoped></style>
