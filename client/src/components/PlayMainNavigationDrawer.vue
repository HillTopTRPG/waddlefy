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
      <template v-for="session in (graphQlStore?.state.sessions || [])" :key="session.id">
        <user-nav-item
          :label='session.name'
          :show-label='!rail'
          :value='session.id'
          prepend-icon='home'
          :tooltip-text='session.name'
          @select="emits('update:nav', session.id)"
        />
      </template>
      <user-nav-item
        v-if="graphQlStore?.state.user?.token"
        label='セッション追加'
        :show-label='!rail'
        value=''
        prepend-icon='home-plus-outline'
        tooltip-text='セッション追加'
        @select="addSession()"
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
    v-if="isReady"
    title="あなたの設定"
    :modal-value="dialog === 'profile'"
    @update:modal-value="v => { dialog = v ? 'profile' : '' }"
  >
    <v-list>
      <v-list-subheader style="min-height: auto">名前</v-list-subheader>
      <v-list-item>
        <v-text-field
          :readonly="!editUserName"
          label=""
          v-model="inputUserName"
          placeholder="セッション名"
          color="primary"
          variant="plain"
          density="compact"
          class="name-text-field"
          style="letter-spacing: 1em; min-height: 1em"
          hide-details
          ref="inputUserNameElm"
          @keydown.enter="$event.keyCode === 13 && updateUserName()"
          @click:append-inner.stop
        >
          <template v-slot:append-inner v-if="isOwnerControl">
            <v-divider :vertical="true" />
            <v-defaults-provider :defaults="{ VBtn: { stacked: true, variant: 'text', size: 'x-small' } }">
              <v-btn
                v-if="editUserName"
                :disabled="!inputUserName"
                prepend-icon="mdi-check-bold"
                text="決定"
                class="bg-transparent h-100 px-1"
                @click.prevent.stop="updateUserName()"
                @mousedown.prevent.stop
                @mouseup.prevent.stop
              />
              <v-btn
                v-else
                prepend-icon="mdi-pencil"
                text="編集"
                class="bg-transparent h-100 px-1"
                @click.prevent.stop="startEditUserName()"
                @mousedown.prevent.stop
                @mouseup.prevent.stop
              />
            </v-defaults-provider>
          </template>
        </v-text-field>
      </v-list-item>
      <v-list-item>
        <v-btn
          @click="onChangeIcon()"
          v-if="graphQlStore?.state.user?.token"
          variant="text"
          text="アイコンを変更する"
        />
      </v-list-item>
    </v-list>
  </play-main-nav-dialog>
</template>

<script lang="ts" setup>
import {watch, inject, ref, computed} from 'vue'
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

const editUserName = ref(false)
const inputUserNameElm = ref()
const isOwnerControl = computed(() => Boolean(graphQlStore?.state.user?.token))
const inputUserName = ref(graphQlStore?.state.user?.name || '')
async function updateUserName() {
  await graphQlStore?.updateUserName(inputUserName.value)
  editUserName.value = false
}
function startEditUserName() {
  editUserName.value = true
  setTimeout(() => {
    inputUserNameElm.value.focus()
  }, 100)
}

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

function onClickExpand() {
  if (dialog.value) {
    saveRail.value = !props.rail
    dialog.value = ''
  } else {
    emits('update:rail', !props.rail)
  }
}

watch(() => graphQlStore?.state.sessions?.length, () => {
  emits('update:nav', graphQlStore?.state.session?.id || '')
})

function addSession() {
  graphQlStore?.addDefaultSession()
}

function logout() {
  router.push({ name: 'Home' })
}

const isReady = ref(false)
setTimeout(() => {
  isReady.value = true
}, 500)

function onChangeIcon() {
  graphQlStore?.updateUserIcon()
}
</script>

<style lang="scss" scoped>
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
</style>
