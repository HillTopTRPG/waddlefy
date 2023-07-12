<template>
  <v-navigation-drawer
    id="play-main-navigation-drawer"
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
      class="py-0 px-0"
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
      <v-list :nav="true" class="pt-1 pb-0">
        <v-divider />
        <v-list-item class="pa-0 mb-0" v-if="graphQlStore?.state.user">
          <template v-slot:prepend>
            <user-avatar
              :token="graphQlStore?.state.user?.iconToken || ''"
              id="user-icon"
              class="mr-3 my-3"
              @click="dialog = dialog === 'profile' ? '' : 'profile'"
            />
          </template>
          <template v-if="!rail">
            <v-list-item-title class='pl-1' v-text="graphQlStore?.state.user?.name || ''" />
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

  <play-main-nav-dialog
    title="プロフィール"
    transition="slide-y-reverse-transition"
    :modal-value="dialog === 'profile'"
    @update:modal-value="v => { dialog = v ? 'profile' : '' }"
  >
    <v-list lines="two" subheader>
      <v-list-subheader>User Controls</v-list-subheader>
      <v-list-item title="Content filtering" subtitle="Set the content filtering level to restrict apps that can be downloaded"></v-list-item>
      <v-list-item title="Password" subtitle="Require password for purchase or use password to restrict purchase"></v-list-item>
    </v-list>
    <v-divider />
    <v-list>
      <v-list-subheader>General</v-list-subheader>
    </v-list>
  </play-main-nav-dialog>
</template>

<script lang="ts" setup>
import {watch, inject, ref} from 'vue'
import UserNavItem from '@/components/parts/UserNavItem.vue'
import UserAvatar from '@/components/parts/UserAvatar.vue'
import PlayMainNavDialog from '@/components/PlayMainNavDialog.vue'

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

const dialog = ref('')
const saveRail = ref(false)
watch(dialog, () => {
  if (dialog.value) {
    saveRail.value = props.rail
    emits('update:rail', false)
  } else {
    emits('update:rail', saveRail.value)
  }
})

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
