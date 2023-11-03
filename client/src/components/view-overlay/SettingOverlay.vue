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
          <v-card-subtitle class="pa-0">画面名</v-card-subtitle>
          <natural-text-field label="画面名" :value="dashboard?.name || ''" @submit="v => updateDashboardName(v)" />
        </v-list-item>
        <v-list-item>
          <v-card-subtitle class="pa-0">使える人（主催者はどの画面も必ず使えます）</v-card-subtitle>
          <v-select
            :items="scopeSelector"
            item-title="label"
            item-value="value"
            :multiple="true"
            :model-value="dashboard?.option.scope || ''"
          >
            <template #item="{ item }">
              <template v-if="item.value === 'all' || item.value === 'owner'">
                <v-list-item
                  @click.prevent.stop="updateScope(item.value)"
                  :title="item.title"
                  :value="item.value"
                  :active="item.value === dashboard?.option.scope"
                />
                <v-divider class="my-2" v-if="item.value === 'owner'"></v-divider>
              </template>
              <template v-else>
                <template v-if="dashboard?.option.scope !== 'all' && dashboard?.option.scope !== 'owner'">
                  <v-list-item
                    @click.prevent.stop="toggleScopePlayer(item.value)"
                    :title="item.title"
                    :value="item.value"
                    :active="dashboard?.option.scope.some(s => s === item.value)"
                  >
                    <template #prepend>
                      <v-checkbox-btn :model-value="dashboard?.option.scope.some(s => s === item.value)" />
                    </template>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item
                    @click.prevent.stop="updateScope([item.value])"
                    :title="item.title"
                    :value="item.value"
                    :active="false"
                  >
                    <template #prepend>
                      <v-checkbox-btn :model-value="false" />
                    </template>
                  </v-list-item>
                </template>
              </template>
            </template>
          </v-select>
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
import { DashboardOption } from '@/components/graphql/schema'
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

const scopeSelector = computed(() => {
  return [
    { label: '全員', value: 'all' },
    { label: '主催者のみ', value: 'owner' },
    ...(graphQlStore?.state.players || []).map(p => ({
      label: p.name,
      value: p.id
    }))
  ]
})

async function toggleScopePlayer(playerId: string) {
  const scope = graphQlStore?.state.dashboard?.option.scope
  if (scope === undefined) return
  if (!scope || scope === 'all' || scope === 'owner') return updateScope([playerId])
  const idx = scope.findIndex(s => s === playerId)
  const useScope = [...scope]
  if (idx < 0) {
    useScope.push(playerId)
  } else {
    useScope.splice(idx, 1)
  }
  if (!useScope.length) return updateScope('all')
  return updateScope(useScope)
}

async function updateScope(scope: DashboardOption['scope'] | string) {
  if (!graphQlStore) return

  console.log(scope)
  let useScope: DashboardOption['scope']
  if (scope === 'all' || scope === 'owner') useScope = scope
  else if (typeof scope === 'string') useScope = [scope]
  else if (scope.some(s => s === 'all')) useScope = 'all'
  else if (scope.some(s => s === 'owner')) useScope = 'owner'
  else useScope = scope

  if (JSON.stringify(graphQlStore.state.dashboard?.option.scope) === JSON.stringify(useScope)) return
  await graphQlStore.updateDashboardOption({
    ...(graphQlStore.state.dashboard?.option || {}),
    scope: useScope
  })
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