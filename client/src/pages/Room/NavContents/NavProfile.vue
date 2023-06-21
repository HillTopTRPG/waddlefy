<script setup lang='ts'>
import { useRouter } from 'vue-router'
import { computed, inject, ref, watch } from 'vue'
import DeleteDialogButton from '~/pages/Room/Dialog/DeleteDialogButton.vue'
import {User, UserTypeSelection, userTypeSelection} from "@/views/graphql/schema";
import {GraphQlKey, GraphQlStore} from "@/views/graphql/graphql";
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  room_uuid: string
  user_uuid?: string
  user_name?: string
  user_password?: string
  nav1?: string | 'room-info'
  nav2: string
  users: User[]
}>()

const emits = defineEmits<{
  (e: 'requireUserLogin'): void
  (e: 'close'): void
}>()

const user       = computed(() => props.users.find(u => u.id === props.user_uuid))
const targetUser = computed(() => props.users.find(u => u.id === props.nav1))

const router = useRouter()

const env = {
  router
}

const userName = ref('')
watch(user, () => {
  userName.value = user.value?.name || ''
}, {
        deep     : true,
        immediate: true,
      })

const userType = ref<UserTypeSelection | undefined>(userTypeSelection.find(s => s.value === user.value?.type))
const targetUserType = ref<UserTypeSelection | undefined>(userTypeSelection.find(s => s.value === targetUser.value?.type))
watch(() => user.value?.type, (value) => {
  userType.value = userTypeSelection.find(s => s.value === value) || userTypeSelection[1]
})

//const userColor = ref('#ff0000')
//const swatches  = [
//  ['#ff0000', '#aa0000', '#550000'],
//  ['#ffff00', '#aaaa00', '#555500'],
//  ['#00ff00', '#00aa00', '#005500'],
//  ['#00ffff', '#00aaaa', '#005555'],
//  ['#0000ff', '#0000aa', '#000055'],
//]

const updateUser = () => {
  const name      = userName.value
  const type = userType.value?.value
  if (!name || !props.user_uuid || !user.value) {
    return
  }
  return graphQlStore?.patchUser( { name, type })
}

const deleteUser = async () => {
  graphQlStore?.deleteUser()
}
</script>

<template>
  <v-overlay class='nav-contents' :contained='true' :model-value='nav2 === "profile"'>
    <v-list :nav='true' bg-color='transparent' v-if='user_uuid === nav1'>
      <v-list-subheader>あなたのアカウント情報</v-list-subheader>
      <v-list-item>
        <v-text-field
          v-model='userName'
          label='名前'
          hint='必須項目'
        />
      </v-list-item>
      <v-list-item>
        <v-select
          v-model='userType'
          :items='userTypeSelection'
          item-value='value'
          item-title='title'
          :hint='userType?.hint || ""'
          label='ユーザータイプ'
          persistent-hint
          return-object
        />
      </v-list-item>
      <v-list-item>
        <v-btn color='secondary' @click='updateUser()'>更新</v-btn>
        <delete-dialog-button button-text='削除' dialog-title='このユーザーを削除しますか？' @execute='deleteUser()' />
      </v-list-item>
    </v-list>
    <template v-else>
      {{ targetUser?.name }}({{ targetUserType?.title || 'プレイヤー' }})
    </template>
    <v-container class='d-flex align-center justify-center'>
      <v-btn icon='mdi-close' size='small' variant='tonal' @click='emits("close")'></v-btn>
    </v-container>
  </v-overlay>
</template>
