<template>
  <v-card
    class="pa-2 overflow-hidden"
    variant="elevated"
    :style="`outline: rgb(var(--v-theme-${roiceDamages[roice.damage].color})) solid 3px`"
    style="box-sizing: content-box; outline-offset: -3px"
    :min-width="`${width}rem`"
    :max-width="`${width}rem`"
  >
    <v-card-text class="pa-0 d-flex flex-column flex-grow-0 align-self-start">
      <v-sheet class="d-flex flex-column" style="max-height: 10em">
        <menu-edit-text-field
          label="対象"
          icon="mdi-hand-pointing-right"
          :editable="true"
          variant="solo-filled"
          :width="width"
          :text="roice.name"
          @update="onUpdateRoiceName"
        />
      </v-sheet>
    </v-card-text>
    <v-card-text class="px-0 py-1 d-flex flex-row" style="gap: 0.3rem">
      <chip-select prefix="" :selections="posSelections" v-model="selectedPos" />
      <chip-select prefix="狂気度" :selections="roiceDamages" v-model="roiceDamage" />
    </v-card-text>
    <v-card-subtitle class="px-0">発狂効果</v-card-subtitle>
    <v-card-text class="px-0 py-1 d-flex flex-row align-stretch">
      <v-sheet class="pa-0 d-flex flex-row justify-start bg-transparent" style="gap: 0.5rem">
        <span class="d-flex font-weight-bold text-no-wrap">{{ roice.neg }}</span>
        <span class="d-flex justify-start align-start">{{ roice.breakEffect }}</span>
      </v-sheet>
    </v-card-text>
    <v-card-text class="px-0 py-1 d-flex flex-row">
      <menu-edit-text-area
        :editable="true"
        icon="mdi-text-box-outline"
        variant="solo-filled"
        :text-rows="3"
        :width="width"
        :offset="-2 * 24"
        label="備考など"
        :text="roice.memo"
        @update="onUpdateRoiceMemo"
      />
    </v-card-text>
    <v-card-actions class="py-0 d-flex flex-row justify-end" style="min-height: auto">
      <delete-menu-btn type="未練" :target-name="roice.name" @execute="emits('delete')" />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import DeleteMenuBtn from '@/components/DeleteMenuBtn.vue'
import ChipSelect from '@/components/panes/Nechronica/component/ChipSelect.vue'
import { NechronicaRoice, posSelections, roiceDamages, roiceList } from '@/components/panes/Nechronica/nechronica'
import { clone } from '@/components/panes/PrimaryDataUtility'
import MenuEditTextArea from '@/components/parts/MenuEditTextArea.vue'
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'
import { ref, watch } from 'vue'

const props = defineProps<{
  roice: NechronicaRoice
}>()

const emits = defineEmits<{
  (e: 'update', roice: NechronicaRoice): void
  (e: 'delete'): void
}>()

const width = 17.5

function emitUpdateCloneRoice(callback: (clonedRoice: NechronicaRoice) => boolean) {
  const clonedRoice = clone(props.roice)!
  if (!callback(clonedRoice)) return
  emits('update', clonedRoice)
}

watch(
  () => props.roice,
  () => {
    selectedPos.value = props.roice.id
    roiceDamage.value = props.roice.damage
  },
  { deep: true }
)

const selectedPos = ref(props.roice.id)
watch(selectedPos, idx => {
  emitUpdateCloneRoice(c => {
    const rawData = roiceList[idx]
    let execute = c.id !== idx || c.pos !== rawData.pos
    execute = execute || !(c.neg === rawData.neg && c.breakEffect === rawData.breakEffect)
    if (execute) {
      c.id = idx
      c.pos = rawData.pos
      c.neg = rawData.neg
      c.breakEffect = rawData.breakEffect
    }
    return execute
  })
})

const roiceDamage = ref(props.roice.damage)
watch(roiceDamage, damage => {
  emitUpdateCloneRoice(c => {
    if (c.damage === damage) return false
    c.damage = damage
    return true
  })
})

function onUpdateRoiceName(name: string) {
  emitUpdateCloneRoice(c => {
    if (c.name === name) return false
    c.name = name
    return true
  })
}

function onUpdateRoiceMemo(memo: string) {
  emitUpdateCloneRoice(c => {
    if (c.memo === memo) return false
    c.memo = memo
    return true
  })
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
