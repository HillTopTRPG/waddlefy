<template>
  <v-navigation-drawer
    :rail='rail'
    rail-width='54'
    :permanent='true'
    :elevation="0"
  >
    <template v-slot:prepend>
      <!-- メインナビゲーションドロワー ヘッダー -->
      <v-list :nav='true' density='compact' class="pb-0 pt-0 mb-1">
        <v-list-item density="default" class="pa-0 pt-0 mb-0">
          <template v-slot:prepend>
            <v-btn
              density="comfortable"
              variant="text"
              :icon="rail ? 'mdi-menu' : 'mdi-backburger'"
              @click="emits('update:rail', !rail)"
              class="my-3 mr-2"
            />
          </template>
          <div class="text-h6 d-inline-block" v-if="!rail">
            <ruby style="ruby-position: under">Waddlefy<rt>ワドルフィ</rt></ruby>
          </div>
          <template v-slot:append>
            <v-btn
              prepend-icon="mdi-cog"
              variant="text"
              :stacked="true"
              size="x-small"
              class="px-0"
              :color="nav == 'setting' ? 'primary' : ''"
              text="設定"
              @click="emits('update:nav', 'setting')"
              v-if="!rail"
            />
          </template>
        </v-list-item>
        <v-divider />
      </v-list>
    </template>

    <!-- メインナビゲーションドロワー コンテンツ -->
    <v-list
      :nav='true'
      density='compact'
      select-strategy="single-leaf"
      open-strategy="single"
      :selected="[nav]"
      :mandatory="true"
      class="py-0"
    >
      <template v-for="dashboard in (graphQlStore?.state.dashboards || [])" :key="dashboard.id">
        <user-nav-item
          :label='dashboard.name'
          :show-label='!rail'
          :value='dashboard.id'
          prepend-icon='view-dashboard'
          :tooltip-text='dashboard.name'
          @select="emits('update:nav', dashboard.id)"
        />
      </template>
      <user-nav-item
        v-if="graphQlStore?.state.user?.token"
        label='ダッシュボード追加'
        :show-label='!rail'
        value=''
        prepend-icon='plus'
        tooltip-text='ダッシュボード追加'
        @select="addDashboard()"
      />
    </v-list>

    <template v-slot:append>
      <!-- メインナビゲーションドロワー フッター -->
      <v-list :nav="true" class="pt-1">
        <v-divider />
        <v-list-item class="pa-0 mb-0" v-if="graphQlStore?.state.user">
          <template v-slot:prepend>
            <user-avatar
              :user="graphQlStore?.state.user!"
              class="mr-3 my-3"
              @click="emits('update:nav', 'profile')"
            />
          </template>
          <template v-if="!rail">
            <v-list-item-title class='pl-1' v-text="graphQlStore?.state.user?.name || ''" />
            <v-list-item-title class='pl-1' v-text="`id: ${graphQlStore?.state.user?.id || ''}`" />
          </template>
          <template v-slot:append>
            <v-btn
              prepend-icon="mdi-logout"
              variant="text"
              :stacked="true"
              size="x-small"
              class="px-0"
              text="ログアウト"
              v-if="!rail"
              @click="logout()"
            />
          </template>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { watch, inject } from 'vue'
import UserNavItem from '@/components/parts/UserNavItem.vue'
import UserAvatar from '@/components/parts/UserAvatar.vue'

import { GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps<{
  rail: boolean
  nav: string
}>()

const emits = defineEmits<{
  (e: 'update:rail', value: boolean): void
  (e: 'update:nav', value: string): void
}>()

if (!props.nav) {
  emits('update:nav', graphQlStore?.state.dashboard?.id || '')
}

watch(() => graphQlStore?.state.dashboards?.length, () => {
  emits('update:nav', graphQlStore?.state.dashboard?.id || '')
})

function addDashboard() {
  graphQlStore?.addDefaultDashboard()
}

function logout() {
  router.push({ name: 'Home' })
}
</script>
