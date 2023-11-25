<template>
  <v-menu :close-on-content-click="false" location="bottom center">
    <template #activator="{ props }">
      <v-badge
        :value="roiceDamages[roice.damage].label"
        :content="roiceDamages[roice.damage].label"
        :color="roiceDamages[roice.damage].color"
        location="bottom right"
        offset-x="12"
        :model-value="roice.damage < 4"
        offset-y="0"
      >
        <v-chip
          class="overflow-visible"
          :color="roiceDamages[roice.damage].color"
          variant="tonal"
          border
          style="height: 3em; min-width: 2.5rem; max-width: 4rem; box-sizing: content-box"
          v-bind="props"
        >
          <div class="text-wrap text-caption d-flex flex-column">
            <span class="ellipsis mb-1" style="max-width: 4rem; box-sizing: content-box; line-height: 1em">{{
              roice.name
            }}</span>
            <span v-if="roice.damage < 4">{{ roice.pos }}</span>
            <ruby v-else class="font-weight-normal" style="line-height: 1em"
              >{{ roice.neg }}<rt style="font-size: 8px">{{ roice.pos }}</rt></ruby
            >
          </div>
        </v-chip>
      </v-badge>
    </template>
    <v-card class="pa-2" style="box-sizing: content-box" min-width="300" max-width="300">
      <v-card-text class="px-0 py-2">
        <span>{{ roice.name }}への</span>
        <span class="font-weight-bold">{{ roice.pos }}</span>
      </v-card-text>
      <v-card-text class="px-0 py-1">
        <v-chip
          :color="roiceDamages[roiceDamage].color"
          class="pa-0"
          density="default"
          style="line-height: 1.4em"
          variant="tonal"
        >
          <v-select
            class="chip-select"
            :color="roiceDamages[roiceDamage].color"
            :flat="true"
            :hide-details="true"
            density="compact"
            :items="roiceDamages"
            item-value="value"
            item-title="text"
            prefix="発狂度: "
            v-model="roiceDamage"
          >
            <template #selection="{ item }">
              <span class="text-h6">{{ item.title }}</span>
            </template>
          </v-select>
        </v-chip>
      </v-card-text>
      <v-card-subtitle class="px-0">発狂効果</v-card-subtitle>
      <v-card-text class="px-0 py-1 d-flex flex-row align-stretch">
        <v-sheet class="pa-0 d-flex flex-row justify-start" style="gap: 0.5rem">
          <span class="d-flex font-weight-bold text-no-wrap">{{ roice.neg }}</span>
          <span class="d-flex justify-start align-start">{{ roice.breakEffect }}</span>
        </v-sheet>
      </v-card-text>
      <v-card-subtitle class="px-0">備考</v-card-subtitle>
      <v-card-text class="px-0 py-1">{{ roice.memo || 'なし' }}</v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { NechronicaRoice } from '@/components/panes/Nechronica/nechronica'
import { ref, watch } from 'vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps<{
  roice: NechronicaRoice
}>()

const emits = defineEmits<{
  (e: 'update-damage', damage: number): void
}>()

const roiceDamages = [
  { value: 0, label: '０', text: '０', color: 'success' },
  { value: 1, label: '１', text: '１', color: 'success' },
  { value: 2, label: '２', text: '２', color: 'success' },
  { value: 3, label: '３', text: '３', color: 'warning' },
  { value: 4, label: '狂', text: '発狂', color: 'error' }
]

const roiceDamage = ref(props.roice.damage)
watch(
  () => props.roice.damage,
  v => {
    roiceDamage.value = v
  }
)
watch(roiceDamage, v => {
  emits('update-damage', v)
})
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped>
.chip-select {
  flex-grow: 0;

  :deep(.v-field) {
    padding: 0 8px;
  }
  :deep(.v-field__field) {
    display: flex;
    flex-direction: row;
    align-items: center;

    .v-field__input,
    .v-select__selection,
    .v-text-field__prefix,
    .v-text-field__prefix__text,
    .v-field__append-inner {
      margin: 0;
      padding: 0;
      font-size: 14px;
    }
  }
  :deep(.v-field__append-inner) .v-icon {
    margin: 0;
  }
}
</style>
