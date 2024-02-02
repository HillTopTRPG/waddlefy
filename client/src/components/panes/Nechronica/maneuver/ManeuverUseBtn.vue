<template>
  <v-menu :close-on-content-click="false" v-model="opened">
    <template #activator="{ props }">
      <v-btn
        density="comfortable"
        :text="$t(used ? 'Nechronica.label.to-unused' : 'Nechronica.label.to-use')"
        v-bind="props"
      />
    </template>
    <v-card>
      <v-card-text class="pt-2 pb-0">
        <template v-if="!used">
          <div class="d-flex flex-row align-baseline">
            <span>{{ $t('Nechronica.label.cost') }}:</span>
            <template v-if="addNum">
              <span class="text-h6">{{ getActionValueNum(cost) + addNum }}</span>
              <span>={{ cost }}{{ `${addNum > 0 ? '+' : ''}${addNum}` }}</span>
            </template>
            <template v-else>
              <span class="text-h6">{{ cost }}</span>
            </template>
          </div>
          <v-text-field
            :hide-details="true"
            :persistent-placeholder="true"
            density="compact"
            :step="1"
            :label="$t('Nechronica.label.cost-collection-value')"
            type="number"
            v-model="additionalCost"
            ref="inputElm"
          />
        </template>
        <span v-else>{{ $t('Nechronica.label.to-unused-confirm-message') }}</span>
      </v-card-text>
      <v-card-text class="py-2 d-flex flex-row justify-end">
        <v-btn @click="execute" density="comfortable" :text="$t('label.decision')" />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { getActionValueNum } from '@/components/panes/Nechronica/nechronica'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  used: boolean
  cost: string
}>()

const inputElm = ref()
const opened = ref(false)
watch(opened, v => {
  if (!v) return
  setTimeout(() => inputElm.value?.focus(), 10)
})

const emits = defineEmits<{
  (e: 'execute', used: boolean, cost: number): void
}>()

const additionalCost = ref('0')
const addNum = computed(() => parseInt(additionalCost.value, 10))
watch(
  () => props.cost,
  () => {
    additionalCost.value = '0'
  }
)

function execute() {
  opened.value = false
  emits('execute', !props.used, getActionValueNum(props.cost) + addNum.value)
}
</script>

<!--suppress HtmlUnknownAttribute -->
<style lang="scss" scoped></style>
