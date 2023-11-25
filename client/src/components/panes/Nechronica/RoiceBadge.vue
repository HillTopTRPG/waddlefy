<template>
  <v-menu
    :close-on-content-click="false"
    :max-width="`${width}rem`"
    location="bottom left"
    scroll-strategy="close"
    style="box-sizing: content-box"
  >
    <template #activator="{ props }">
      <v-defaults-provider :defaults="{ VBadge: { location: 'bottom right', offsetX: 12 } }">
        <v-badge v-if="roice.damage < 3" :value="getValue()" :content="getValue()" :color="getColor()">
          <roice-chip :roice="roice" :color="roiceDamages[roice.damage].color" :bind-props="props" />
        </v-badge>
        <v-badge v-else-if="roice.damage === 3" :value="getValue()" :content="getValue()" :color="getColor()">
          <roice-chip :roice="roice" :color="roiceDamages[roice.damage].color" :bind-props="props" />
        </v-badge>
        <roice-chip v-else :roice="roice" :color="roiceDamages[roice.damage].color" :bind-props="props" />
      </v-defaults-provider>
    </template>
    <v-card class="pa-2" style="box-sizing: content-box" :min-width="`${width}rem`" :max-width="`${width}rem`">
      <v-card-text class="px-0 py-2 d-flex flex-column flex-grow-0 align-self-start">
        <v-sheet class="d-flex flex-column" style="max-height: 10em">
          <menu-edit-text-field
            label="対象"
            icon="mdi-relation-one-to-one"
            :editable="true"
            variant="solo-filled"
            :width="width"
            :text="roice.name"
            @update="onUpdateRoiceName"
          />
        </v-sheet>
      </v-card-text>
      <v-card-text class="px-0 py-1">
        <chip-select prefix="" :selections="posSelections" v-model="selectedPos" />
        <chip-select prefix="狂気度" :selections="roiceDamages" v-model="roiceDamage" />
      </v-card-text>
      <v-card-subtitle class="px-0">発狂効果</v-card-subtitle>
      <v-card-text class="px-0 py-1 d-flex flex-row align-stretch">
        <v-sheet class="pa-0 d-flex flex-row justify-start" style="gap: 0.5rem">
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
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import ChipSelect from '@/components/panes/Nechronica/ChipSelect.vue'
import RoiceChip from '@/components/panes/Nechronica/RoiceChip.vue'
import { NechronicaRoice, roiceList } from '@/components/panes/Nechronica/nechronica'
import { clone } from '@/components/panes/PrimaryDataUtility'
import MenuEditTextArea from '@/components/parts/MenuEditTextArea.vue'
import MenuEditTextField from '@/components/parts/MenuEditTextField.vue'
import { ref, watch } from 'vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  roice: NechronicaRoice
}>()

const emits = defineEmits<{
  (e: 'update', roice: NechronicaRoice): void
}>()

const width = 18

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

const posSelections = roiceList.map((r, idx) => ({
  value: idx,
  text: r.pos,
  subTitle: r.target,
  color: 'black'
}))

const roiceDamages = [
  { value: 0, label: '０', text: '０', subTitle: '', color: 'success' },
  { value: 1, label: '１', text: '１', subTitle: '', color: 'success' },
  { value: 2, label: '２', text: '２', subTitle: '', color: 'success' },
  { value: 3, label: '３', text: '３', subTitle: '', color: 'warning' },
  { value: 4, label: '狂', text: '発狂', subTitle: '', color: 'error' }
]

function getValue(): string {
  return roiceDamages[props.roice.damage].label
}

function getColor(): string {
  return roiceDamages[props.roice.damage].color
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
