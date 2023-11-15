<template>
  <v-menu
    width="auto"
    v-model="opened"
    location="bottom center"
    transition="scroll-y-transition"
    scroll-strategy="close"
    :close-on-content-click="false"
  >
    <template v-slot:activator="{ props }">
      <v-text-field
        :model-value="value"
        :hide-details="true"
        variant="solo"
        :style="`width: ${width}rem; max-width: ${width}rem`"
        :flat="true"
        :readonly="true"
        :persistent-placeholder="true"
        :class="classText || ''"
        v-bind="props"
      >
        <template v-slot:label>
          <v-icon v-if="icon" :icon="icon" class="mr-1" />
          {{ label }}
        </template>
      </v-text-field>
    </template>
    <v-card :rounded="false" border>
      <v-card-item class="pa-2">
        <v-autocomplete
          v-model="editValue"
          :items="tokugiList"
          :style="`width: ${width}rem; max-width: ${width}rem`"
          color="blue-grey lighten-2"
          variant="solo-filled"
          :custom-filter="customFilter"
          :hide-details="true"
          :persistent-placeholder="true"
          item-title="label"
          item-value="label"
          ref="editElm"
        >
          <template v-slot:label>
            <v-icon v-if="icon" :icon="icon" class="mr-1" />
            {{ label }}
          </template>
          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props" :title="item?.raw?.label" :subtitle="item?.raw?.group" />
          </template>
        </v-autocomplete>
      </v-card-item>
      <v-divider />
      <v-card-actions class="px-2">
        <v-btn class="flex-0-1-100 text-decoration-underline" variant="text" @click="opened = false">キャンセル</v-btn>
        <v-btn color="primary" class="flex-0-1-100" variant="flat" @click="onSubmit()">保存</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { SkillKind, SkillTable } from '@/components/panes/Shinobigami/shinobigami'
import { ref, watch } from 'vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  value: string
  label: string
  icon: string
  width?: number
  editable: boolean
  classText?: string
}>()

const opened = ref(false)
const editValue = ref(props.value)
const editElm = ref()

const transpose = a => a[0].map((_, c) => a.map((rt, r) => ({ label: rt[c], group: `${SkillKind[c]}(${r + 2})` })))
const tokugiList = transpose(SkillTable).flat()
tokugiList.forEach((t, idx) => t.id === idx)

const emits = defineEmits<{
  (e: 'update', value: string): Promise<void>
}>()
function customFilter(itemTitle, queryText, item) {
  const textOne = item.raw.label.toLowerCase()
  const textTwo = item.raw.group.toLowerCase()
  const searchText = queryText.toLowerCase()

  return textOne.indexOf(searchText) > -1 || textTwo.indexOf(searchText) > -1
}

watch(
  () => props.value,
  v => {
    editValue.value = v
  }
)

watch(opened, v => {
  if (!props.editable) {
    opened.value = false
  }
  if (v) {
    editValue.value = props.value
    setTimeout(() => editElm.value?.focus(), 300)
  }
})

function onSubmit() {
  emits('update', editValue.value)
  opened.value = false
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
