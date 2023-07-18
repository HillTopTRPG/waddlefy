<template>
  <contents-overlay
    title="画面の設定"
    color="bg-light-green"
    :modal-value="modalValue"
    image="paint_00019.jpg"
    @close="emits('close')"
  >
    <v-card-text class="pa-2 overflow-auto h-100">
      <v-list class="ma-0 pa-0 bg-transparent">
        <v-list-item>
          <v-card-subtitle class="py-0">画面名</v-card-subtitle>
          <natural-text-field
            label="画面名"
            :value="dashboard?.name || ''"
            @submit="v => updateDashboardName(v)"
          />
        </v-list-item>
        <v-list-item>
          <delete-dialog-btn
            :target-name="dashboard?.name || ''"
            :session-id="graphQlStore?.state.session?.id || ''"
            type="画面"
            @execute="deleteDashboardExecute()"
          />
        </v-list-item>
      </v-list>
    </v-card-text>
  </contents-overlay>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import ContentsOverlay from '@/components/view-overlay/ContentsOverlay.vue'
import NaturalTextField from '@/components/NaturalTextField.vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
import DeleteDialogBtn from '@/components/DeleteDialogBtn.vue'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

defineProps<{
  modalValue: boolean
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const dashboard = computed(() => graphQlStore?.state.dashboard || null)

async function updateDashboardName(name: string) {
  if (!graphQlStore) return
  await graphQlStore.updateDashboardName(name)
}

async function deleteDashboardExecute() {
  console.log('deleteDashboardExecute')
  if (!graphQlStore) return
  await graphQlStore.deleteDashboard(graphQlStore?.state.session?.id || '', dashboard.value?.id || '')
}
</script>

<style lang="scss" scoped>
:deep(.contents-overlay .v-card) {
  border: 3px solid blue;
}
.contents-overlay {
  border: 3px solid green;

  .v-card {
    background-image: url('/paint_00007.jpg');
    background-color: rgba(255, 255, 255, 0.5);
    background-blend-mode: lighten;
  }
}
</style>
