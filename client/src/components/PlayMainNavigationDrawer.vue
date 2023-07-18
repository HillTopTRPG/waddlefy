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
              @click="onClickExpand()"
              class="my-3 mr-2"
            />
          </template>
          <v-fade-transition>
            <div class="text-h6 d-inline-block" v-if="!rail">
              <ruby style="ruby-position: under">Waddlefy<rt>ワドルフィ</rt></ruby>
            </div>
          </v-fade-transition>
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
      :selected="[sessionId]"
      :mandatory="true"
      class="py-0 px-0"
    >
      <template v-for="session in (graphQlStore?.state.sessions || [])" :key="session.id">
        <user-nav-item
          :title='session.name'
          icon='home'
          :rail="rail"
          :active="sessionId === session.id"
          :toggle="true"
          @click="graphQlStore?.directSessionAccess(session.id)"
        />
      </template>

      <v-menu v-if="isReady" location="right" :scrim="true" v-model="addSessionMenu" :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <user-nav-item
            v-bind="props"
            id="addSessionNavItem"
            title='セッション追加'
            icon='home-plus-outline'
            :rail="rail"
            :toggle="false"
            v-if="graphQlStore?.state.user?.token"
          />
        </template>
        <v-card min-width="20em">
          <v-card-title class="bg-secondary">セッション追加</v-card-title>
          <v-card-item>
            <v-text-field
              label="セッション名"
              placeholder="No title session"
              :autofocus="true"
              v-model="addSessionName"
              ref="addSessionNameElm"
              hide-details
              @keydown.enter="$event.keyCode === 13 && addSession()"
            />
          </v-card-item>
          <v-card-actions>
            <v-btn class="d-block flex-grow-1" color="primary" variant="elevated" @click="addSession()">確定</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
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
              style="margin-left: 3px;"
              @click="dialogInNav = dialogInNav === 'profile' ? '' : 'profile'"
            />
          </template>
          <v-fade-transition>
            <v-list-item-title class='pl-1' v-if="!rail" style="white-space: nowrap;" v-text="graphQlStore?.state.user?.name || ''" />
          </v-fade-transition>
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

  <nav-dialog
    title="あなたの設定"
    attach="#play-main-navigation-drawer"
    :modal-value="dialogInNav === 'profile'"
    @close="dialogInNav = ''"
    class="my-16"
    v-if="isReady"
  >
    <v-list class="h-100">
      <v-list-subheader style="min-height: auto; background: none;">名前</v-list-subheader>
      <v-list-item>
        <natural-text-field
          label="あなたの名前"
          :value="graphQlStore?.state.user?.name || ''"
          @submit="v => updateUserName(v)"
        />
      </v-list-item>
      <v-list-item>
        <v-btn
          @click="onChangeIcon()"
          v-if="graphQlStore?.state.user?.token"
          variant="outlined"
          text="アイコンを変更する"
        />
      </v-list-item>
    </v-list>
  </nav-dialog>
</template>

<script lang="ts" setup>
import { watch, inject, ref, computed, onMounted } from 'vue'
import UserNavItem from '@/components/parts/UserNavItem.vue'
import UserAvatar from '@/components/parts/UserAvatar.vue'
import NavDialog from '@/components/NavDialog.vue'

import { DEFAULT_SESSION_NAME, GraphQlKey, GraphQlStore } from '@/components/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

import { useRouter } from 'vue-router'
import NaturalTextField from '@/components/NaturalTextField.vue'
const router = useRouter()

const props = defineProps<{
  rail: boolean
}>()

const sessionId = computed(() => graphQlStore?.state.session?.id)

const emits = defineEmits<{
  (e: 'update:rail', value: boolean): void
}>()

async function updateUserName(name: string) {
  await graphQlStore?.updateUserName(name)
}

const dialogInNav = ref('')
const saveRail = ref(false)
watch(dialogInNav, () => {
  if (dialogInNav.value) {
    saveRail.value = props.rail
    emits('update:rail', false)
  } else {
    emits('update:rail', saveRail.value)
  }
})

function onClickExpand() {
  if (dialogInNav.value) {
    saveRail.value = !props.rail
    dialogInNav.value = ''
  } else {
    emits('update:rail', !props.rail)
  }
}

async function addSession() {
  if (!graphQlStore) return
  await graphQlStore?.addDefaultSession(addSessionName.value)
  addSessionMenu.value = false
  addSessionName.value = DEFAULT_SESSION_NAME
}

function logout() {
  router.push({ name: 'Home' })
}

const isReady = ref(false)
onMounted(() => {
  isReady.value = true
})

function onChangeIcon() {
  graphQlStore?.updateUserIcon()
}

const addSessionNameElm = ref()
const addSessionName = ref(DEFAULT_SESSION_NAME)
const addSessionMenu = ref(false)
watch(addSessionMenu, () => {
  if (addSessionMenu.value) {
    setTimeout(() => {
      addSessionNameElm.value.focus()
    }, 100)
  }
})
</script>

<style lang="scss" scoped>
:deep(.nav-dialog) {
  .v-card {
    background-image: url('/white_00053.jpg');
    background-color: rgba(255, 255, 255, 0.6);
    background-blend-mode: lighten;
  }

  .v-list {
    background: none;
  }

  .v-btn {
    border-color: rgba(0, 0, 0, 0.2);
  }
}

.name-text-field {
  align-self: stretch;
  grid-template-columns: repeat(auto-fill, 1fr);
  grid-template-rows: 1fr auto;
}

.name-text-field:deep(.v-field--appended) {
  padding-inline-end: 0
}

.name-text-field:deep(.v-field__input),
.name-text-field:deep(.v-field__append-inner) {
  padding-top: 0
}

.name-text-field:deep(.v-field__input) {
  min-height: auto;
  height: 100%;
  letter-spacing: 0;
}

.v-navigation-drawer :deep(.v-navigation-drawer__content) {
  max-width: initial;
}
.v-navigation-drawer > :deep(*) {
  margin-right: -1px;
}
</style>
