<template>
  <v-text-field
    :readonly="!editing"
    label=""
    v-model="inputValue"
    :placeholder="label"
    variant="plain"
    density="comfortable"
    class="name-text-field"
    style="letter-spacing: 1em; min-height: 1em"
    :hide-details="true"
    ref="textFieldElm"
    @keydown.enter="$event.keyCode === 13 && submit()"
    :autofocus="true"
    @click:control.stop
    @click:append-inner.stop
  >
    <template #append-inner>
      <template v-if="editable">
        <v-divider :vertical="true" />
        <v-defaults-provider :defaults="{ VBtn: { stacked: true, variant: 'text', size: 'x-small' } }">
          <v-btn
            v-if="editing"
            :disabled="!inputValue"
            prepend-icon="mdi-check-bold"
            text="決定"
            class="bg-transparent h-100 px-1"
            @click.prevent.stop="submit()"
            @mousedown.prevent.stop
            @mouseup.prevent.stop
          />
          <v-btn
            v-else
            prepend-icon="mdi-pencil"
            text="編集"
            class="bg-transparent h-100 px-1"
            @click.prevent.stop="editStart()"
            @mousedown.prevent.stop
            @mouseup.prevent.stop
          />
        </v-defaults-provider>
      </template>
    </template>
  </v-text-field>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps<{
  value: string
  label: string
  editable: boolean
}>()

watch(
  () => props.value,
  v => {
    inputValue.value = v
  }
)

const emits = defineEmits<{
  (e: 'submit', value: string): Promise<void>
}>()

const editing = ref(false)
const textFieldElm = ref()
const inputValue = ref(props.value)
async function submit() {
  await emits('submit', inputValue.value)
  editing.value = false
}
function editStart() {
  editing.value = true
  setTimeout(() => {
    textFieldElm.value.focus()
  }, 100)
}
</script>

<style lang="scss" scoped>
.name-text-field {
  align-self: stretch;
  grid-template-columns: repeat(auto-fill, 1fr);
  grid-template-rows: 1fr auto;
}

.name-text-field:deep(.v-field--appended) {
  padding-inline-end: 0;
}

.name-text-field:deep(.v-field__input),
.name-text-field:deep(.v-field__append-inner) {
  padding-top: 0 !important;
}

.name-text-field:deep(.v-field__input) {
  min-height: auto;
  height: 100%;
  letter-spacing: 0;
}
</style>
